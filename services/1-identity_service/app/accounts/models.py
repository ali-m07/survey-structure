from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='users')
    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=255, blank=True, null=True)
    biometric_enabled = models.BooleanField(default=False)
    sso_provider = models.CharField(max_length=50, blank=True, null=True)
    sso_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        unique_together = [['username', 'tenant']]


class Role(models.Model):
    name = models.CharField(max_length=255)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='roles')
    permissions = models.ManyToManyField('Permission', related_name='roles')

    class Meta:
        db_table = 'roles'

    def __str__(self):
        return self.name


class Permission(models.Model):
    name = models.CharField(max_length=255)
    codename = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = 'permissions'

    def __str__(self):
        return self.name


class Invitation(models.Model):
    email = models.EmailField()
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invitations'

