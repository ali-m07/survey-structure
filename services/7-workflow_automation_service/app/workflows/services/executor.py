"""Workflow executor service."""
import requests
import os
import time
from typing import Dict, Any
from django.utils import timezone
from app.workflows.models import Workflow, WorkflowExecution, Step
import logging

logger = logging.getLogger(__name__)


class WorkflowExecutor:
    """Service for executing workflows."""
    
    def __init__(self):
        self.ai_service_url = os.getenv("AI_ML_SERVICE_URL", "http://ai-ml-service:8000")
        self.n8n_webhook_url = os.getenv("N8N_WEBHOOK_URL", "http://n8n:5678/webhook")
    
    def execute_workflow(self, workflow: Workflow, input_data: Dict[str, Any] = None) -> WorkflowExecution:
        """Execute a workflow."""
        execution = WorkflowExecution.objects.create(
            workflow=workflow,
            status='running'
        )
        
        try:
            result = self._execute_steps(workflow, input_data or {})
            execution.status = 'completed'
            execution.result = result
            execution.completed_at = timezone.now()
        except Exception as e:
            execution.status = 'failed'
            execution.error_message = str(e)
            execution.completed_at = timezone.now()
            logger.error(f"Workflow execution failed: {e}")
        
        execution.save()
        return execution
    
    def _execute_steps(self, workflow: Workflow, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute workflow steps."""
        result = {'steps': []}
        current_data = input_data.copy()
        
        steps = workflow.workflow_steps.all().order_by('order')
        
        for step in steps:
            step_result = self._execute_step(step, current_data)
            result['steps'].append({
                'step_id': str(step.id),
                'step_name': step.name,
                'result': step_result
            })
            current_data.update(step_result)
        
        return result
    
    def _execute_step(self, step: Step, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single step."""
        if step.step_type == 'action':
            return self._execute_action(step, input_data)
        elif step.step_type == 'condition':
            return self._execute_condition(step, input_data)
        elif step.step_type == 'delay':
            return self._execute_delay(step, input_data)
        elif step.step_type == 'webhook':
            return self._execute_webhook(step, input_data)
        elif step.step_type == 'ai_condition':
            return self._execute_ai_condition(step, input_data)
        else:
            raise ValueError(f"Unknown step type: {step.step_type}")
    
    def _execute_action(self, step: Step, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an action step."""
        action_type = step.config.get('action_type')
        # Placeholder for action execution
        return {'action_executed': action_type, 'status': 'success'}
    
    def _execute_condition(self, step: Step, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a condition step."""
        condition = step.config.get('condition')
        # Evaluate condition
        return {'condition_result': True}
    
    def _execute_delay(self, step: Step, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a delay step."""
        import time
        delay_seconds = step.config.get('delay_seconds', 0)
        time.sleep(delay_seconds)
        return {'delayed': delay_seconds}
    
    def _execute_webhook(self, step: Step, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a webhook step."""
        webhook_url = step.config.get('url', self.n8n_webhook_url)
        try:
            response = requests.post(webhook_url, json=input_data, timeout=30)
            response.raise_for_status()
            return {'webhook_response': response.json()}
        except Exception as e:
            logger.error(f"Webhook execution failed: {e}")
            return {'webhook_error': str(e)}
    
    def _execute_ai_condition(self, step: Step, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an AI condition step."""
        if not hasattr(step, 'ai_condition'):
            return {'ai_condition_result': False, 'error': 'No AI condition configured'}
        
        ai_condition = step.ai_condition
        try:
            response = requests.post(
                f"{self.ai_service_url}/api/v1/models/chat",
                json={
                    "prompt": f"{ai_condition.prompt}\n\nInput data: {input_data}",
                    "model": ai_condition.model
                },
                timeout=30
            )
            response.raise_for_status()
            ai_response = response.json().get('response', '')
            
            # Check if response matches expected result
            result = ai_condition.expected_result.lower() in ai_response.lower()
            return {'ai_condition_result': result, 'ai_response': ai_response}
        except Exception as e:
            logger.error(f"AI condition execution failed: {e}")
            return {'ai_condition_result': False, 'error': str(e)}

