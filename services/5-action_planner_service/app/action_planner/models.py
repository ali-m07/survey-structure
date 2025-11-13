from django.db import models
from django.contrib.postgres.fields import JSONField


class ActionItem(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='action_items')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    assigned_to = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'action_items'
        ordering = ['-priority', '-created_at']

    def __str__(self):
        return self.title


class Recommendation(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='recommendations')
    source = models.CharField(max_length=100)  # ai_insight, survey_analysis, etc.
    source_id = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    description = models.TextField()
    confidence_score = models.FloatField(default=0.0)
    category = models.CharField(max_length=100)
    action_items = models.ManyToManyField(ActionItem, related_name='recommendations', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_applied = models.BooleanField(default=False)

    class Meta:
        db_table = 'recommendations'
        ordering = ['-confidence_score', '-created_at']

    def __str__(self):
        return self.title


class SimulationOutcome(models.Model):
    recommendation = models.ForeignKey(Recommendation, on_delete=models.CASCADE, related_name='simulations')
    scenario = models.CharField(max_length=255)
    outcome_data = models.JSONField(default=dict)
    success_probability = models.FloatField(default=0.0)
    expected_impact = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'simulation_outcomes'

    def __str__(self):
        return f"{self.recommendation.title} - {self.scenario}"

