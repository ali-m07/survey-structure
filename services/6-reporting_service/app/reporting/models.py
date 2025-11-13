from django.db import models
from django.contrib.postgres.fields import JSONField


class Report(models.Model):
    REPORT_TYPE_CHOICES = [
        ('survey', 'Survey Report'),
        ('performance', 'Performance Report'),
        ('engagement', 'Engagement Report'),
        ('custom', 'Custom Report'),
    ]
    
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('csv', 'CSV'),
        ('excel', 'Excel'),
        ('json', 'JSON'),
        ('html', 'HTML'),
    ]
    
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='reports')
    name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPE_CHOICES)
    format = models.CharField(max_length=20, choices=FORMAT_CHOICES, default='pdf')
    data_source = models.JSONField(default=dict)
    filters = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    file_path = models.CharField(max_length=500, blank=True)
    is_scheduled = models.BooleanField(default=False)
    schedule_cron = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Dashboard(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='dashboards')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    layout = models.JSONField(default=dict)
    widgets = models.JSONField(default=list)
    is_public = models.BooleanField(default=False)
    created_by = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dashboards'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class InteractiveWidget(models.Model):
    WIDGET_TYPE_CHOICES = [
        ('chart', 'Chart'),
        ('table', 'Table'),
        ('metric', 'Metric'),
        ('map', 'Map'),
        ('timeline', 'Timeline'),
    ]
    
    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE, related_name='interactive_widgets')
    widget_type = models.CharField(max_length=50, choices=WIDGET_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    config = models.JSONField(default=dict)
    data_query = models.JSONField(default=dict)
    position = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'interactive_widgets'
        ordering = ['position']

    def __str__(self):
        return f"{self.dashboard.name} - {self.title}"

