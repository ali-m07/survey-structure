from django.db import models


class ConsentLog(models.Model):
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE)
    consent_type = models.CharField(max_length=255)
    granted = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()

    class Meta:
        db_table = 'consent_logs'


class DataResidencyConfig(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    region = models.CharField(max_length=255)
    data_storage_location = models.CharField(max_length=255)

    class Meta:
        db_table = 'data_residency_configs'


class AuditTrail(models.Model):
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=255)
    resource_id = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    metadata = models.JSONField(default=dict)

    class Meta:
        db_table = 'audit_trails'

