from django.db import models
from django.contrib.postgres.fields import JSONField


class FeedbackItem(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='feedback_items')
    submitted_by = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True)
    target_user = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name='received_feedback_items')
    feedback_text = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    sentiment_score = models.FloatField(null=True, blank=True)
    category = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'feedback_items'
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback for {self.target_user.get_full_name()}"


class AnonymousChannel(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='anonymous_channels')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'anonymous_channels'

    def __str__(self):
        return self.name


class SentimentScore(models.Model):
    feedback_item = models.OneToOneField(FeedbackItem, on_delete=models.CASCADE, related_name='sentiment')
    positive_score = models.FloatField(default=0.0)
    negative_score = models.FloatField(default=0.0)
    neutral_score = models.FloatField(default=0.0)
    overall_sentiment = models.CharField(max_length=20)  # positive, negative, neutral
    analyzed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sentiment_scores'

    def __str__(self):
        return f"Sentiment: {self.overall_sentiment}"

