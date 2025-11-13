from django.db import models
from django.contrib.postgres.fields import JSONField


class Department(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    parent_department = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='sub_departments')
    manager = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_departments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'departments'
        ordering = ['name']

    def __str__(self):
        return self.name


class Employee(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='employees')
    user = models.OneToOneField('accounts.CustomUser', on_delete=models.CASCADE, related_name='employee_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    job_title = models.CharField(max_length=255)
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='direct_reports')
    hire_date = models.DateField()
    termination_date = models.DateField(null=True, blank=True)
    employment_type = models.CharField(max_length=50)  # full-time, part-time, contract
    location = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'employees'
        ordering = ['employee_id']

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"


class HierarchyNode(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='hierarchy_nodes')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='hierarchy_nodes')
    parent_node = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='child_nodes')
    level = models.IntegerField(default=0)
    path = models.CharField(max_length=500, blank=True)  # Materialized path for efficient queries
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hierarchy_nodes'
        indexes = [
            models.Index(fields=['tenant', 'level']),
            models.Index(fields=['path']),
        ]

    def __str__(self):
        return f"{self.employee} - Level {self.level}"


class SuccessionPlanning(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='succession_plans')
    position = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='succession_plans')
    successor = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='successor_plans')
    readiness_level = models.CharField(max_length=50)  # ready, developing, not-ready
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'succession_planning'
        unique_together = [['position', 'successor']]

    def __str__(self):
        return f"{self.position} -> {self.successor}"

