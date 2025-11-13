from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from app.organization.models import Department, Employee, HierarchyNode, SuccessionPlanning
from app.organization.apis.serializers import (
    DepartmentSerializer, EmployeeSerializer, HierarchyNodeSerializer, SuccessionPlanningSerializer
)
from app.organization.services.org_chart_service import OrgChartService


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
    @action(detail=True, methods=['get'])
    def employees(self, request, pk=None):
        """Get all employees in a department."""
        department = self.get_object()
        employees = Employee.objects.filter(department=department)
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    
    @action(detail=True, methods=['get'])
    def direct_reports(self, request, pk=None):
        """Get direct reports of an employee."""
        employee = self.get_object()
        reports = Employee.objects.filter(manager=employee)
        serializer = EmployeeSerializer(reports, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def sync_to_neo4j(self, request, pk=None):
        """Sync employee to Neo4j."""
        employee = self.get_object()
        org_service = OrgChartService()
        
        employee_data = {
            'id': employee.employee_id,
            'name': employee.user.get_full_name(),
            'email': employee.user.email,
            'job_title': employee.job_title,
            'department': employee.department.name if employee.department else None
        }
        
        success = org_service.sync_employee_to_neo4j(employee.employee_id, employee_data)
        
        if success:
            return Response({'status': 'synced'})
        else:
            return Response({'status': 'error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HierarchyNodeViewSet(viewsets.ModelViewSet):
    queryset = HierarchyNode.objects.all()
    serializer_class = HierarchyNodeSerializer
    
    @action(detail=True, methods=['get'])
    def org_chart(self, request, pk=None):
        """Get organization chart from this node."""
        node = self.get_object()
        org_service = OrgChartService()
        org_chart = org_service.get_org_chart(node.employee.employee_id, depth=5)
        return Response(org_chart)


class SuccessionPlanningViewSet(viewsets.ModelViewSet):
    queryset = SuccessionPlanning.objects.all()
    serializer_class = SuccessionPlanningSerializer

