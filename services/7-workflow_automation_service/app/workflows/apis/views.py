from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from app.workflows.models import Workflow, Step, Trigger, AICondition, WorkflowExecution
from app.workflows.apis.serializers import (
    WorkflowSerializer, StepSerializer, TriggerSerializer, 
    AIConditionSerializer, WorkflowExecutionSerializer
)
from app.workflows.services.executor import WorkflowExecutor


class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Workflow.objects.filter(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Execute a workflow."""
        workflow = self.get_object()
        input_data = request.data.get('input_data', {})
        
        executor = WorkflowExecutor()
        execution = executor.execute_workflow(workflow, input_data)
        
        serializer = WorkflowExecutionSerializer(execution)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a workflow."""
        workflow = self.get_object()
        workflow.status = 'active'
        workflow.save()
        return Response({'status': 'activated'})


class StepViewSet(viewsets.ModelViewSet):
    queryset = Step.objects.all()
    serializer_class = StepSerializer
    permission_classes = [IsAuthenticated]


class TriggerViewSet(viewsets.ModelViewSet):
    queryset = Trigger.objects.all()
    serializer_class = TriggerSerializer
    permission_classes = [IsAuthenticated]


class AIConditionViewSet(viewsets.ModelViewSet):
    queryset = AICondition.objects.all()
    serializer_class = AIConditionSerializer
    permission_classes = [IsAuthenticated]


class WorkflowExecutionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WorkflowExecution.objects.all()
    serializer_class = WorkflowExecutionSerializer
    permission_classes = [IsAuthenticated]

