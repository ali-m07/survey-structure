from django.db import models
from django.contrib.postgres.fields import JSONField


class Workflow(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('archived', 'Archived'),
    ]
    
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='workflows')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    trigger_config = models.JSONField(default=dict)
    steps = models.JSONField(default=list)
    created_by = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_executed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'workflows'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Step(models.Model):
    STEP_TYPE_CHOICES = [
        ('action', 'Action'),
        ('condition', 'Condition'),
        ('delay', 'Delay'),
        ('webhook', 'Webhook'),
        ('ai_condition', 'AI Condition'),
    ]
    
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='workflow_steps')
    step_type = models.CharField(max_length=50, choices=STEP_TYPE_CHOICES)
    name = models.CharField(max_length=255)
    config = models.JSONField(default=dict)
    order = models.IntegerField(default=0)
    next_step = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'steps'
        ordering = ['order']

    def __str__(self):
        return f"{self.workflow.name} - {self.name}"


class Trigger(models.Model):
    TRIGGER_TYPE_CHOICES = [
        ('event', 'Event'),
        ('schedule', 'Schedule'),
        ('webhook', 'Webhook'),
        ('manual', 'Manual'),
    ]
    
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='triggers')
    trigger_type = models.CharField(max_length=50, choices=TRIGGER_TYPE_CHOICES)
    config = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'triggers'

    def __str__(self):
        return f"{self.workflow.name} - {self.trigger_type}"


class AICondition(models.Model):
    step = models.OneToOneField(Step, on_delete=models.CASCADE, related_name='ai_condition')
    prompt = models.TextField()
    model = models.CharField(max_length=100, default='gemma3')
    expected_result = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_conditions'

    def __str__(self):
        return f"AI Condition for {self.step.name}"


class WorkflowExecution(models.Model):
    STATUS_CHOICES = [
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='executions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='running')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    result = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)

    class Meta:
        db_table = 'workflow_executions'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.workflow.name} - {self.status}"

