"""n8n automation service for notifications."""
import os
import requests
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)


class N8NAutomationService:
    """Service for integrating with n8n workflows."""
    
    def __init__(self):
        self.base_url = os.getenv("N8N_BASE_URL", "http://localhost:5678")
        self.api_key = os.getenv("N8N_API_KEY", "")
        self.webhook_url = os.getenv("N8N_WEBHOOK_URL", f"{self.base_url}/webhook")
    
    def trigger_workflow(self, workflow_id: str, data: Dict[str, Any]) -> bool:
        """Trigger an n8n workflow by ID."""
        try:
            headers = {
                "X-N8N-API-KEY": self.api_key,
                "Content-Type": "application/json"
            } if self.api_key else {"Content-Type": "application/json"}
            
            response = requests.post(
                f"{self.base_url}/api/v1/workflows/{workflow_id}/execute",
                json=data,
                headers=headers
            )
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Error triggering n8n workflow: {e}")
            return False
    
    def trigger_webhook(self, webhook_path: str, data: Dict[str, Any]) -> bool:
        """Trigger an n8n webhook."""
        try:
            webhook_url = f"{self.webhook_url}/{webhook_path}"
            response = requests.post(webhook_url, json=data)
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Error triggering n8n webhook: {e}")
            return False
    
    def send_survey_invitation_email(self, survey_id: str, recipient_email: str, survey_link: str, tenant_id: str) -> bool:
        """Send survey invitation email via n8n."""
        data = {
            "event_type": "survey_invitation",
            "survey_id": survey_id,
            "recipient_email": recipient_email,
            "survey_link": survey_link,
            "tenant_id": tenant_id
        }
        return self.trigger_webhook("survey-invitation", data)
    
    def send_survey_completion_notification(self, survey_id: str, participant_id: str, tenant_id: str) -> bool:
        """Send survey completion notification via n8n."""
        data = {
            "event_type": "survey_completion",
            "survey_id": survey_id,
            "participant_id": participant_id,
            "tenant_id": tenant_id
        }
        return self.trigger_webhook("survey-completion", data)
    
    def send_survey_reminder(self, survey_id: str, recipient_email: str, survey_link: str, tenant_id: str) -> bool:
        """Send survey reminder via n8n."""
        data = {
            "event_type": "survey_reminder",
            "survey_id": survey_id,
            "recipient_email": recipient_email,
            "survey_link": survey_link,
            "tenant_id": tenant_id
        }
        return self.trigger_webhook("survey-reminder", data)
    
    def send_ai_suggestions_notification(self, user_id: str, suggestions: List[Dict[str, Any]], tenant_id: str) -> bool:
        """Send AI-generated suggestions notification via n8n."""
        data = {
            "event_type": "ai_suggestions",
            "user_id": user_id,
            "suggestions": suggestions,
            "tenant_id": tenant_id
        }
        return self.trigger_webhook("ai-suggestions", data)
    
    def send_workflow_trigger(self, workflow_name: str, trigger_data: Dict[str, Any], tenant_id: str) -> bool:
        """Trigger a custom workflow in n8n."""
        data = {
            "event_type": "workflow_trigger",
            "workflow_name": workflow_name,
            "trigger_data": trigger_data,
            "tenant_id": tenant_id
        }
        return self.trigger_webhook("workflow-trigger", data)
    
    def send_notification(self, channel: str, recipient: str, message: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        """Send notification via n8n to various channels."""
        data = {
            "event_type": "notification",
            "channel": channel,  # email, slack, teams, sms, etc.
            "recipient": recipient,
            "message": message,
            "metadata": metadata or {}
        }
        return self.trigger_webhook("notification", data)

