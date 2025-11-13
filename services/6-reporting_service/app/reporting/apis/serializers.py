from rest_framework import serializers
from app.reporting.models import Report, Dashboard, InteractiveWidget


class ReportSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Report
        fields = ['id', 'tenant', 'name', 'report_type', 'format', 'data_source',
                 'filters', 'created_by', 'created_by_name', 'created_at', 'updated_at',
                 'file_path', 'is_scheduled', 'schedule_cron']
        read_only_fields = ['id', 'created_at', 'updated_at', 'file_path']


class InteractiveWidgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = InteractiveWidget
        fields = ['id', 'dashboard', 'widget_type', 'title', 'config', 'data_query',
                 'position', 'created_at']
        read_only_fields = ['id', 'created_at']


class DashboardSerializer(serializers.ModelSerializer):
    widgets = InteractiveWidgetSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Dashboard
        fields = ['id', 'tenant', 'name', 'description', 'layout', 'widgets',
                 'is_public', 'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

