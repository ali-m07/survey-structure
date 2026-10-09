from django.db import models
# Django 4.2+ has built-in JSONField
try:
    JSONField = models.JSONField
except AttributeError:
    from django.contrib.postgres.fields import JSONField


class Survey(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('archived', 'Archived'),
    ]
    
    tenant_id = models.CharField(max_length=255, default='default', db_index=True)  # Simplified for now
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by_id = models.CharField(max_length=255, null=True, blank=True)  # Simplified for now
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    settings = models.JSONField(default=dict)
    blockchain_hash = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'surveys'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Section(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sections'
        ordering = ['order']

    def __str__(self):
        return f"{self.survey.title} - {self.title}"


class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('text', 'Text'),
        ('multiple_choice', 'Multiple Choice'),
        ('single_choice', 'Single Choice'),
        ('rating', 'Rating'),
        ('scale', 'Scale'),
        ('matrix', 'Matrix'),
        ('ranking', 'Ranking'),
        ('file_upload', 'File Upload'),
        ('date', 'Date'),
        ('voice', 'Voice Input'),
        ('number', 'Number'), ('email', 'Email'), ('boolean', 'Boolean'), ('nps', 'NPS'),
    ]
    
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=50, choices=QUESTION_TYPE_CHOICES)
    is_required = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    options = models.JSONField(default=list, blank=True)  # For multiple choice, etc.
    validation_rules = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'questions'
        ordering = ['order']

    def __str__(self):
        return self.question_text[:50]


class Participant(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='participants')
    email = models.EmailField()
    token = models.CharField(max_length=255, unique=True)
    invited_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_anonymous = models.BooleanField(default=False)

    class Meta:
        db_table = 'participants'
        unique_together = [['survey', 'email']]

    def __str__(self):
        return f"{self.survey.title} - {self.email}"


class Submission(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='submissions')
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name='submissions', null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    blockchain_hash = models.CharField(max_length=255, blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'submissions'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Submission for {self.survey.title} at {self.submitted_at}"


class Answer(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    answer_text = models.TextField(blank=True)
    answer_value = models.JSONField(default=dict, blank=True)  # For complex answers
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'answers'
        unique_together = [['submission', 'question']]

    def __str__(self):
        return f"Answer for {self.question.question_text[:50]}"


class RealTimeResponse(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='realtime_responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='realtime_responses')
    answer_data = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'realtime_responses'
        ordering = ['-timestamp']


class DEIQuestionSet(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='dei_question_sets')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    questions = models.ManyToManyField(Question, related_name='dei_question_sets')
    benchmark_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'dei_question_sets'

    def __str__(self):
        return self.name



class Membership(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='survey_memberships')
    tenant_id = models.CharField(max_length=255, db_index=True)
    role = models.CharField(max_length=20, choices=[('admin','Admin'),('editor','Editor'),('viewer','Viewer')], default='editor')
    class Meta:
        unique_together = [('user', 'tenant_id')]

class AuditEvent(models.Model):
    tenant_id = models.CharField(max_length=255, db_index=True)
    user = models.ForeignKey('auth.User', null=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=100)
    object_id = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    detail = models.JSONField(default=dict)
