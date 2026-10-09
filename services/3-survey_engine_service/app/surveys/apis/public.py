import uuid
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from app.surveys.models import Survey, Participant, Submission, Answer
from .serializers import SurveySerializer
from app.surveys.services.validation import active_questions, validate_value

def available(survey, token=None):
    now = timezone.now()
    if survey.status != 'active' or survey.starts_at and now < survey.starts_at or survey.ends_at and now >= survey.ends_at:
        raise ValidationError('This survey is not accepting responses.')
    participant = None
    if token:
        participant = survey.participants.filter(token=token).first()
        if not participant: raise ValidationError('Invalid invitation token.')
        if participant.completed_at and not survey.settings.get('allow_multiple',False): raise ValidationError('This invitation has already been completed.')
    elif survey.settings.get('invitation_only',False): raise ValidationError('An invitation is required.')
    return participant

@api_view(['GET'])
@permission_classes([AllowAny])
def public_survey(request, pk):
    survey = get_object_or_404(Survey, pk=pk)
    available(survey, request.query_params.get('token'))
    data = SurveySerializer(survey).data
    for key in ('tenant_id','created_by_id','participant_count','submission_count','blockchain_hash'): data.pop(key,None)
    data['settings'] = {k:v for k,v in survey.settings.items() if k in ('language','allow_multiple','invitation_only','randomize_questions')}
    return Response(data)

@api_view(['POST'])
@permission_classes([AllowAny])
@transaction.atomic
def submit(request, pk):
    survey = get_object_or_404(Survey.objects.select_for_update(), pk=pk)
    token = request.data.get('token') or request.query_params.get('token')
    try: response_id = str(uuid.UUID(request.data.get('response_id','')))
    except (ValueError,TypeError,AttributeError): raise ValidationError({'response_id':'A UUID response ID is required.'})
    previous = survey.submissions.filter(response_id=response_id).first()
    if previous:
        if previous.participant_id and previous.participant.token != token: raise ValidationError('Invalid invitation token.')
        return Response({'id':previous.id,'status':'completed'})
    participant = available(survey, token)
    rows = request.data.get('answers')
    if not isinstance(rows,list): raise ValidationError({'answers':'Expected an array.'})
    values = {}
    for row in rows:
        if not isinstance(row,dict) or not isinstance(row.get('question'),int) or row['question'] in values: raise ValidationError('Invalid or duplicate question.')
        values[row['question']] = row.get('answer_value', row.get('value',row.get('answer_text')))
    visible = active_questions(survey,values)
    allowed = {q.id:q for q in visible}
    if set(values) - set(allowed): raise ValidationError('Answers contain unknown or hidden questions.')
    errors = {}
    for q in visible:
        try: validate_value(q,values.get(q.id))
        except ValidationError as exc: errors[str(q.id)] = exc.detail
    if errors: raise ValidationError({'answers':errors})
    submission = Submission.objects.create(survey=survey, participant=participant, response_id=response_id, metadata={'response_id':response_id}, ip_address=request.META.get('REMOTE_ADDR'))
    Answer.objects.bulk_create([Answer(submission=submission,question=allowed[key],answer_value=value,answer_text=value if isinstance(value,str) else '') for key,value in values.items()])
    if participant:
        participant.completed_at = timezone.now()
        participant.save(update_fields=['completed_at'])
    from app.surveys.services.webhooks import enqueue
    enqueue(submission)
    return Response({'id':submission.id,'status':'completed'},status=201)
