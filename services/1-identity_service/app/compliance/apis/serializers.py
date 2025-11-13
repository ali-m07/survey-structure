from rest_framework import serializers
from app.compliance.models import ConsentLog, DataResidencyConfig, AuditTrail


class ConsentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsentLog
        fields = ['id', 'user', 'consent_type', 'granted', 'timestamp', 'ip_address']
        read_only_fields = ['id', 'timestamp']


class DataResidencyConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataResidencyConfig
        fields = ['id', 'tenant', 'region', 'data_storage_location']
        read_only_fields = ['id']


class AuditTrailSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditTrail
        fields = ['id', 'user', 'action', 'resource_type', 'resource_id', 'timestamp', 'ip_address', 'metadata']
        read_only_fields = ['id', 'timestamp']

