from django.db import models
from django.contrib.postgres.fields import JSONField


class ReviewCycle(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    ]
    
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='review_cycles')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'review_cycles'
        ordering = ['-start_date']

    def __str__(self):
        return self.name


class Goal(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='goals')
    employee = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    target_value = models.FloatField(null=True, blank=True)
    current_value = models.FloatField(default=0.0)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default='in_progress')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'goals'
        ordering = ['-due_date', '-created_at']

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.title}"


class Feedback(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='performance_feedback')
    review_cycle = models.ForeignKey(ReviewCycle, on_delete=models.CASCADE, related_name='feedback', null=True, blank=True)
    employee = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name='received_feedback')
    reviewer = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name='given_feedback')
    rating = models.FloatField(null=True, blank=True)
    comments = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'performance_feedback'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reviewer.get_full_name()} -> {self.employee.get_full_name()}"


class GamificationBadge(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='badges')
    employee = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name='badges')
    badge_type = models.CharField(max_length=100)
    badge_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    earned_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'gamification_badges'
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.badge_name}"

