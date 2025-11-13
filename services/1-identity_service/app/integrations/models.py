from django.db import models


class DirectoryConfiguration(models.Model):
    DIRECTORY_TYPE_CHOICES = [
        ('AD', 'Active Directory'),
        ('LDAP', 'LDAP'),
        ('OKTA', 'Okta'),
        ('AZURE_AD', 'Azure AD'),
    ]
    
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    directory_type = models.CharField(max_length=50, choices=DIRECTORY_TYPE_CHOICES)
    server_url = models.URLField()
    base_dn = models.CharField(max_length=255)
    bind_dn = models.CharField(max_length=255)
    bind_password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'directory_configurations'


class DatabaseConfiguration(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    database_type = models.CharField(max_length=50)
    connection_string = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'database_configurations'


class SCIMConfiguration(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    endpoint = models.URLField()
    bearer_token = models.CharField(max_length=500)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'scim_configurations'

