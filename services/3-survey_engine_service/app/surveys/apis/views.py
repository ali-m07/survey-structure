import secrets
import io
from django.http import HttpResponse
from django.conf import settings
from django.db import transaction
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes, throttle_classes
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from app.surveys.models import Survey, Section, Question, Participant, Submission, Answer, RealTimeResponse, DEIQuestionSet, Membership
from .serializers import SurveySerializer, SectionSerializer, QuestionSerializer, ParticipantSerializer, SubmissionSerializer, AnswerSerializer, RealTimeResponseSerializer, DEIQuestionSetSerializer
from .access import tenant, editable, audit

class LoginThrottle(AnonRateThrottle):
    scope='login'

class GenerationThrottle(UserRateThrottle):
    scope = 'generation'

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LoginThrottle])
def login(request):
    if not isinstance(request.data,dict): raise ValidationError('Expected an object.')
    user = authenticate(username=request.data.get('username'), password=request.data.get('password'))
    if not user:
        return Response({'detail':'Invalid credentials.'}, status=401)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token':token.key, 'user':{'id':user.id,'username':user.username}, 'tenants':list(user.survey_memberships.values('tenant_id','role'))})

@api_view(['GET'])
def me(request):
    return Response({'user':{'id':request.user.id,'username':request.user.username}, 'tenants':list(request.user.survey_memberships.values('tenant_id','role'))})

@api_view(['POST'])
def logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response(status=204)

class ScopedViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    tenant_path = 'survey__tenant_id'
    def get_queryset(self):
        org = tenant(self.request, self.request.method not in ('GET','HEAD','OPTIONS'))
        qs = self.queryset.filter(**{self.tenant_path:org})
        for name in ('survey','section'):
            if name in self.request.query_params and name in [f.name for f in self.queryset.model._meta.fields]:
                qs = qs.filter(**{name+'_id':self.request.query_params[name]})
        return qs
    def perform_create(self, serializer):
        obj=serializer.save()
        audit(self.request,'create.'+obj._meta.model_name,obj)
    def perform_update(self, serializer):
        obj=serializer.save()
        audit(self.request,'update.'+obj._meta.model_name,obj)
    def perform_destroy(self, instance):
        survey = instance if isinstance(instance, Survey) else getattr(instance, 'survey', None) or instance.section.survey
        editable(survey)
        audit(self.request, 'delete.'+instance._meta.model_name, instance)
        instance.delete()

class SurveyViewSet(ScopedViewSet):
    queryset = Survey.objects.all().prefetch_related('sections__questions')
    serializer_class = SurveySerializer
    tenant_path = 'tenant_id'
    @action(detail=True, methods=['post'], throttle_classes=[GenerationThrottle])
    def generate(self, request, pk=None):
        survey = self.get_object()
        tenant(request, True)
        editable(survey)
        from app.surveys.services.generation import generate_proposal
        return Response({'proposal': generate_proposal(request.data)})

    @action(detail=True, methods=['post'], url_path='apply-generated')
    @transaction.atomic
    def apply_generated(self, request, pk=None):
        tenant(request, True)
        survey = Survey.objects.select_for_update().get(pk=self.get_object().pk)
        editable(survey)
        from app.surveys.services.generation import validate_proposal
        if not isinstance(request.data, dict):
            raise ValidationError('Expected a proposal object.')
        proposal = validate_proposal(request.data.get('proposal'))
        existing = survey.sections.order_by('-order', '-id').first()
        next_order = existing.order + 1 if existing else 0
        for offset, section in enumerate(proposal['sections']):
            created = Section.objects.create(survey=survey, title=section['title'], order=next_order + offset)
            for order, question in enumerate(section['questions']):
                Question.objects.create(section=created, order=order, **question)
        fields = []
        if not survey.title.strip():
            survey.title = proposal['title']; fields.append('title')
        if not survey.description.strip():
            survey.description = proposal['description']; fields.append('description')
        survey.save(update_fields=fields + ['updated_at'])
        audit(request, 'apply_generated.survey', survey)
        return Response(SurveySerializer(survey).data, status=201)
    def perform_create(self, serializer):
        obj = serializer.save(tenant_id=tenant(self.request, True), created_by_id=str(self.request.user.id))
        audit(self.request, 'create.survey', obj)
    def perform_update(self, serializer):
        editable(self.get_object())
        obj = serializer.save()
        audit(self.request, 'update.survey', obj)
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        survey = self.get_object()
        editable(survey)
        from app.surveys.services.validation import validate_structure
        validate_structure(survey)
        survey.status = 'active'
        survey.save(update_fields=['status','updated_at'])
        audit(request, 'publish.survey', survey)
        return Response(SurveySerializer(survey).data)
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        survey = self.get_object()
        survey.status = 'closed'
        survey.save(update_fields=['status','updated_at'])
        audit(request, 'close.survey', survey)
        return Response(SurveySerializer(survey).data)
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def duplicate(self, request, pk=None):
        source = self.get_object()
        copy = Survey.objects.create(tenant_id=source.tenant_id, created_by_id=str(request.user.id), title=request.data.get('title',source.title+' (copy)'), description=source.description, settings=source.settings)
        remap = {}
        for section in source.sections.all():
            new_section = Section.objects.create(survey=copy,title=section.title,description=section.description,order=section.order)
            for q in section.questions.all():
                new = Question.objects.create(section=new_section,question_text=q.question_text,question_type=q.question_type,is_required=q.is_required,order=q.order,options=q.options,validation_rules=q.validation_rules)
                remap[q.id] = new.id
        for q in Question.objects.filter(section__survey=copy):
            rules = q.validation_rules
            if rules.get('display_if'): rules['display_if']['question'] = remap.get(rules['display_if']['question'])
            if rules.get('jump_to'): rules['jump_to'] = {k:remap.get(v) for k,v in rules['jump_to'].items()}
            q.validation_rules = rules
            for old,new in remap.items(): q.question_text = q.question_text.replace('{{'+str(old)+'}}','{{'+str(new)+'}}')
            q.save()
        audit(request,'duplicate.survey',copy)
        return Response(SurveySerializer(copy).data,status=201)
    @action(detail=True, methods=['get'])
    def qr(self, request, pk=None):
        import qrcode
        survey = self.get_object()
        buffer = io.BytesIO()
        qrcode.make(f"{settings.SURVEY_WEB_URL.rstrip('/')}/survey/{survey.id}").save(buffer,format='PNG')
        return HttpResponse(buffer.getvalue(),content_type='image/png')
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        from app.surveys.services.reports import analytics
        return Response(analytics(self.get_object(),request.query_params))
    @action(detail=True, methods=['get'], url_path='export')
    def export_data(self, request, pk=None):
        from app.surveys.services.reports import export
        return export(self.get_object(),request.query_params)
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        from app.surveys.models import AuditEvent
        survey = self.get_object()
        return Response(list(AuditEvent.objects.filter(tenant_id=survey.tenant_id,detail__survey_id=survey.id).order_by('-created_at').values('id','action','created_at','detail')[:100]))
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        survey = self.get_object()
        count = survey.participants.count()
        completed = survey.participants.filter(completed_at__isnull=False).count()
        return Response({'total_participants':count,'completed':completed,'pending':count-completed,'submissions':survey.submissions.count(),'completion_rate':100*completed/count if count else 0})

class SectionViewSet(ScopedViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def duplicate(self, request, pk=None):
        source = self.get_object()
        editable(source.survey)
        copied = Section.objects.create(survey=source.survey,title=source.title+' (copy)',description=source.description,order=source.order+1)
        remap = {}
        for q in source.questions.all():
            new = Question.objects.create(section=copied,question_text=q.question_text,question_type=q.question_type,is_required=q.is_required,order=q.order,options=q.options,validation_rules=q.validation_rules)
            remap[q.id] = new.id
        for q in copied.questions.all():
            rules = q.validation_rules
            if rules.get('display_if'): rules['display_if']['question'] = remap.get(rules['display_if']['question'],rules['display_if']['question'])
            if rules.get('jump_to'): rules['jump_to'] = {k:remap.get(v,v) for k,v in rules['jump_to'].items()}
            for old,new in remap.items(): q.question_text = q.question_text.replace('{{'+str(old)+'}}','{{'+str(new)+'}}')
            q.validation_rules=rules;q.save()
        return Response(SectionSerializer(copied).data,status=201)

class QuestionViewSet(ScopedViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    tenant_path = 'section__survey__tenant_id'

class ParticipantViewSet(ScopedViewSet):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer
    def perform_create(self, serializer):
        survey = serializer.validated_data['survey']
        if survey.tenant_id != tenant(self.request, True):
            raise ValidationError('Invalid survey.')
        serializer.save(token=secrets.token_urlsafe(32))
    def perform_update(self, serializer):
        if serializer.validated_data.get('survey', self.get_object().survey).tenant_id != tenant(self.request, True):
            raise ValidationError('Invalid survey.')
        serializer.save()

    @action(detail=True, methods=['post'])
    def send_invitation(self, request, pk=None):
        from app.surveys.services.distribution_service import DistributionService
        participant = self.get_object()
        if participant.survey.status != 'active': raise ValidationError('Publish the survey before inviting respondents.')
        link = DistributionService().invite(participant)
        return Response({'survey_link':link,'status':participant.delivery_status,'error':participant.delivery_error},status=200 if participant.delivery_status in ('sent','test_transport') else 502)

class SubmissionViewSet(ScopedViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    http_method_names = ['get','head','options']

class AnswerViewSet(ScopedViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    tenant_path = 'submission__survey__tenant_id'
    http_method_names = ['get','head','options']

class RealTimeResponseViewSet(ScopedViewSet):
    queryset = RealTimeResponse.objects.all()
    serializer_class = RealTimeResponseSerializer
    http_method_names = ['get','head','options']

class DEIQuestionSetViewSet(ScopedViewSet):
    queryset = DEIQuestionSet.objects.all()
    serializer_class = DEIQuestionSetSerializer
    http_method_names = ['get','head','options']
