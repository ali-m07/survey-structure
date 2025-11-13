from rest_framework import serializers
from app.workflows.models import Workflow, Step, Trigger, AICondition, WorkflowExecution


class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = ['id', 'workflow', 'step_type', 'name', 'config', 'order',
                 'next_step', 'created_at']
        read_only_fields = ['id', 'created_at']


class TriggerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trigger
        fields = ['id', 'workflow', 'trigger_type', 'config', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class AIConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AICondition
        fields = ['id', 'step', 'prompt', 'model', 'expected_result', 'created_at']
        read_only_fields = ['id', 'created_at']


class WorkflowSerializer(serializers.ModelSerializer):
    steps = StepSerializer(many=True, read_only=True)
    triggers = TriggerSerializer(many=True, read_only=True)
    execution_count = serializers.IntegerField(source='executions.count', read_only=True)
    
    class Meta:
        model = Workflow
        fields = ['id', 'tenant', 'name', 'description', 'status', 'trigger_config',
                 'steps', 'triggers', 'created_by', 'created_at', 'updated_at',
                 'last_executed_at', 'execution_count']
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_executed_at']


class WorkflowExecutionSerializer(serializers.ModelSerializer):
    workflow_name = serializers.CharField(source='workflow.name', read_only=True)
    
    class Meta:
        model = WorkflowExecution
        fields = ['id', 'workflow', 'workflow_name', 'status', 'started_at',
                 'completed_at', 'result', 'error_message']
        read_only_fields = ['id', 'started_at', 'completed_at']

