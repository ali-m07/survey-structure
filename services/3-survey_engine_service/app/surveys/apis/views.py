from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Avg
from app.surveys.models import (
    Survey, Section, Question, Participant, Submission, Answer, 
    RealTimeResponse, DEIQuestionSet
)
from app.surveys.apis.serializers import (
    SurveySerializer, SectionSerializer, QuestionSerializer,
    ParticipantSerializer, SubmissionSerializer, AnswerSerializer,
    RealTimeResponseSerializer, DEIQuestionSetSerializer
)
from app.surveys.services.distribution_service import DistributionService
from app.surveys.services.blockchain_service import BlockchainService
import json


class SurveyViewSet(viewsets.ModelViewSet):
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    permission_classes = []  # AllowAny for now to simplify testing
    
    def get_queryset(self):
        # Simplified - return all surveys for now
        tenant_id = self.request.query_params.get('tenant_id', 'default')
        return Survey.objects.filter(tenant_id=tenant_id)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a survey."""
        survey = self.get_object()
        survey.status = 'active'
        survey.save()
        
        # Store survey hash on blockchain
        blockchain_service = BlockchainService()
        survey_data = {
            'id': str(survey.id),
            'title': survey.title,
            'description': survey.description,
            'created_at': survey.created_at.isoformat()
        }
        hash_value = blockchain_service.store_survey_hash(str(survey.id), survey_data)
        survey.blockchain_hash = hash_value
        survey.save()
        
        return Response({'status': 'published', 'blockchain_hash': hash_value})
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get survey statistics."""
        survey = self.get_object()
        total_participants = Participant.objects.filter(survey=survey).count()
        completed = Participant.objects.filter(survey=survey, completed_at__isnull=False).count()
        submissions = Submission.objects.filter(survey=survey).count()
        
        return Response({
            'total_participants': total_participants,
            'completed': completed,
            'pending': total_participants - completed,
            'submissions': submissions,
            'completion_rate': (completed / total_participants * 100) if total_participants > 0 else 0
        })


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = []  # AllowAny for now


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = []  # AllowAny for now


class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer
    permission_classes = []  # AllowAny for now
    
    @action(detail=True, methods=['post'])
    def send_invitation(self, request, pk=None):
        """Send survey invitation to participant."""
        participant = self.get_object()
        distribution_service = DistributionService()
        
        # Generate unique link
        survey_link = distribution_service.generate_survey_link(participant)
        
        # Send invitation via notification service
        # This would trigger n8n workflow
        return Response({'survey_link': survey_link, 'status': 'invitation_sent'})


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = []  # AllowAny for now
    
    def create(self, request, *args, **kwargs):
        """Create a submission with answers."""
        submission_data = request.data
        answers_data = submission_data.pop('answers', [])
        
        # Create submission
        submission = Submission.objects.create(**submission_data)
        
        # Create answers
        for answer_data in answers_data:
            Answer.objects.create(submission=submission, **answer_data)
        
        # Store submission hash on blockchain
        blockchain_service = BlockchainService()
        submission_data_dict = {
            'id': str(submission.id),
            'survey_id': str(submission.survey.id),
            'submitted_at': submission.submitted_at.isoformat(),
            'answers': [{'question_id': str(a.question.id), 'answer': a.answer_text} 
                       for a in submission.answers.all()]
        }
        hash_value = blockchain_service.store_response_hash(str(submission.id), submission_data_dict)
        submission.blockchain_hash = hash_value
        submission.save()
        
        serializer = self.get_serializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = []  # AllowAny for now


class RealTimeResponseViewSet(viewsets.ModelViewSet):
    queryset = RealTimeResponse.objects.all()
    serializer_class = RealTimeResponseSerializer
    permission_classes = []  # AllowAny for now
    
    def create(self, request, *args, **kwargs):
        """Create a real-time response."""
        response = super().create(request, *args, **kwargs)
        # This would trigger WebSocket broadcast in production
        return response


class DEIQuestionSetViewSet(viewsets.ModelViewSet):
    queryset = DEIQuestionSet.objects.all()
    serializer_class = DEIQuestionSetSerializer
    permission_classes = []  # AllowAny for now

