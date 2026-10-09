import secrets
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from app.surveys.models import Survey, Section, Question, Participant, Submission, Answer, RealTimeResponse, DEIQuestionSet, Membership
from .serializers import SurveySerializer, SectionSerializer, QuestionSerializer, ParticipantSerializer, SubmissionSerializer, AnswerSerializer, RealTimeResponseSerializer, DEIQuestionSetSerializer
from .access import tenant, editable, audit

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
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
    def perform_destroy(self, instance):
        survey = instance if isinstance(instance, Survey) else getattr(instance, 'survey', None) or instance.section.survey
        editable(survey)
        audit(self.request, 'delete.'+instance._meta.model_name, instance)
        instance.delete()

class SurveyViewSet(ScopedViewSet):
    queryset = Survey.objects.all().prefetch_related('sections__questions')
    serializer_class = SurveySerializer
    tenant_path = 'tenant_id'
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
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        survey = self.get_object()
        count = survey.participants.count()
        completed = survey.participants.filter(completed_at__isnull=False).count()
        return Response({'total_participants':count,'completed':completed,'pending':count-completed,'submissions':survey.submissions.count(),'completion_rate':100*completed/count if count else 0})

class SectionViewSet(ScopedViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

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
