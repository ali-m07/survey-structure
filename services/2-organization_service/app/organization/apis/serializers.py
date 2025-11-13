from rest_framework import serializers
from app.organization.models import Department, Employee, HierarchyNode, SuccessionPlanning


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'tenant', 'name', 'code', 'description', 'parent_department', 'manager', 'created_at', 'updated_at', 'metadata']
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeeSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    manager_name = serializers.CharField(source='manager.user.get_full_name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'tenant', 'user', 'user_name', 'user_email', 'employee_id', 'department', 
            'department_name', 'job_title', 'manager', 'manager_name', 'hire_date', 
            'termination_date', 'employment_type', 'location', 'created_at', 'updated_at', 'metadata'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class HierarchyNodeSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    
    class Meta:
        model = HierarchyNode
        fields = ['id', 'tenant', 'employee', 'employee_name', 'parent_node', 'level', 'path', 'created_at']
        read_only_fields = ['id', 'created_at']


class SuccessionPlanningSerializer(serializers.ModelSerializer):
    position_name = serializers.CharField(source='position.user.get_full_name', read_only=True)
    successor_name = serializers.CharField(source='successor.user.get_full_name', read_only=True)
    
    class Meta:
        model = SuccessionPlanning
        fields = ['id', 'tenant', 'position', 'position_name', 'successor', 'successor_name', 'readiness_level', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

