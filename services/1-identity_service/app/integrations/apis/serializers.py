from rest_framework import serializers
from app.integrations.models import DirectoryConfiguration, DatabaseConfiguration, SCIMConfiguration


class DirectoryConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DirectoryConfiguration
        fields = ['id', 'tenant', 'directory_type', 'server_url', 'base_dn', 'bind_dn', 'bind_password', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {'bind_password': {'write_only': True}}


class DatabaseConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseConfiguration
        fields = ['id', 'tenant', 'database_type', 'connection_string', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {'connection_string': {'write_only': True}}


class SCIMConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SCIMConfiguration
        fields = ['id', 'tenant', 'endpoint', 'bearer_token', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {'bearer_token': {'write_only': True}}

