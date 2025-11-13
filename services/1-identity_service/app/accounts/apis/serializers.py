from rest_framework import serializers
from app.accounts.models import CustomUser, Role, Permission, Invitation


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'tenant', 'mfa_enabled', 'created_at']
        read_only_fields = ['id', 'created_at']


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'tenant', 'permissions']
        read_only_fields = ['id']


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename']
        read_only_fields = ['id']


class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = ['id', 'email', 'tenant', 'role', 'token', 'expires_at', 'used', 'created_at']
        read_only_fields = ['id', 'token', 'created_at']

