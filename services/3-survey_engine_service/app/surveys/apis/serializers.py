from rest_framework import serializers
from app.surveys.models import (
    Survey, Section, Question, Participant, Submission, Answer,
    RealTimeResponse, DEIQuestionSet
)


class QuestionSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        from .access import tenant, editable
        if self.instance:
            editable(self.instance.section.survey)
        section = attrs.get('section', getattr(self.instance, 'section', None))
        if section and section.survey.tenant_id != tenant(self.context['request'], True):
            raise serializers.ValidationError('Invalid section.')
        if section:
            editable(section.survey)
        kind = attrs.get('question_type', getattr(self.instance, 'question_type', None))
        if kind in ('voice', 'file_upload'):
            raise serializers.ValidationError('File and voice uploads are not supported.')
        return attrs

    class Meta:
        model = Question
        fields = ['id', 'section', 'question_text', 'question_type', 'is_required', 
                 'order', 'options', 'validation_rules', 'created_at']
        read_only_fields = ['id', 'created_at']


class SectionSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        from .access import tenant, editable
        if self.instance:
            editable(self.instance.survey)
        survey = attrs.get('survey', getattr(self.instance, 'survey', None))
        if survey and survey.tenant_id != tenant(self.context['request'], True):
            raise serializers.ValidationError('Invalid survey.')
        if survey:
            editable(survey)
        return attrs

    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Section
        fields = ['id', 'survey', 'title', 'description', 'order', 'questions', 'created_at']
        read_only_fields = ['id', 'created_at']


class SurveySerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    participant_count = serializers.IntegerField(source='participants.count', read_only=True)
    submission_count = serializers.IntegerField(source='submissions.count', read_only=True)
    
    class Meta:
        model = Survey
        fields = ['id', 'tenant_id', 'title', 'description', 'status', 'created_by_id', 
                 'created_at', 'updated_at', 'starts_at', 'ends_at', 'settings',
                 'blockchain_hash', 'sections', 'participant_count', 'submission_count']
        read_only_fields = ['id', 'tenant_id', 'created_by_id', 'status', 'created_at', 'updated_at', 'blockchain_hash']


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ['id', 'survey', 'email', 'token', 'invited_at', 'started_at',
                 'completed_at', 'is_anonymous']
        read_only_fields = ['id', 'token', 'invited_at', 'started_at', 'completed_at']


class AnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    
    class Meta:
        model = Answer
        fields = ['id', 'submission', 'question', 'question_text', 'answer_text',
                 'answer_value', 'created_at']
        read_only_fields = ['id', 'created_at']


class SubmissionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    survey_title = serializers.CharField(source='survey.title', read_only=True)
    
    class Meta:
        model = Submission
        fields = ['id', 'survey', 'survey_title', 'participant', 'submitted_at',
                 'ip_address', 'blockchain_hash', 'metadata', 'answers']
        read_only_fields = ['id', 'submitted_at', 'blockchain_hash']


class RealTimeResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealTimeResponse
        fields = ['id', 'survey', 'question', 'answer_data', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class DEIQuestionSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = DEIQuestionSet
        fields = ['id', 'survey', 'name', 'description', 'questions', 'benchmark_data', 'created_at']
        read_only_fields = ['id', 'created_at']

