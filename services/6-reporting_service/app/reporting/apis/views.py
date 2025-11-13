from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from app.reporting.models import Report, Dashboard, InteractiveWidget
from app.reporting.apis.serializers import (
    ReportSerializer, DashboardSerializer, InteractiveWidgetSerializer
)
from app.reporting.services.report_generator import ReportGenerator
import os


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Report.objects.filter(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """Generate report file."""
        report = self.get_object()
        generator = ReportGenerator()
        
        try:
            file_path = generator.generate_report(report)
            return Response({'file_path': file_path, 'status': 'generated'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def generate_ai_narrated(self, request, pk=None):
        """Generate AI-narrated video report."""
        report = self.get_object()
        generator = ReportGenerator()
        
        try:
            file_path = generator.generate_ai_narrated_report(report)
            return Response({'file_path': file_path, 'status': 'generated'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download report file."""
        report = self.get_object()
        if not report.file_path or not os.path.exists(report.file_path):
            return Response({'error': 'Report file not found'}, status=status.HTTP_404_NOT_FOUND)
        
        from django.http import FileResponse
        return FileResponse(open(report.file_path, 'rb'), as_attachment=True)


class DashboardViewSet(viewsets.ModelViewSet):
    queryset = Dashboard.objects.all()
    serializer_class = DashboardSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Dashboard.objects.filter(tenant=self.request.user.tenant)


class InteractiveWidgetViewSet(viewsets.ModelViewSet):
    queryset = InteractiveWidget.objects.all()
    serializer_class = InteractiveWidgetSerializer
    permission_classes = [IsAuthenticated]

