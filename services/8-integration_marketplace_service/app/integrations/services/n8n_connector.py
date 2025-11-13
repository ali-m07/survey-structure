"""n8n connector service."""
import requests
import os
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class N8NConnector:
    """Service for connecting with n8n workflows."""
    
    def __init__(self):
        self.n8n_base_url = os.getenv("N8N_BASE_URL", "http://localhost:5678")
        self.n8n_api_key = os.getenv("N8N_API_KEY", "")
    
    def trigger_workflow(self, workflow_id: str, data: Dict[str, Any]) -> bool:
        """Trigger an n8n workflow."""
        try:
            headers = {
                "X-N8N-API-KEY": self.n8n_api_key,
                "Content-Type": "application/json"
            } if self.n8n_api_key else {"Content-Type": "application/json"}
            
            response = requests.post(
                f"{self.n8n_base_url}/api/v1/workflows/{workflow_id}/execute",
                json=data,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Error triggering n8n workflow: {e}")
            return False
    
    def create_webhook(self, workflow_id: str, webhook_path: str) -> Optional[str]:
        """Create webhook for n8n workflow."""
        try:
            # This would create a webhook in n8n
            webhook_url = f"{self.n8n_base_url}/webhook/{webhook_path}"
            return webhook_url
        except Exception as e:
            logger.error(f"Error creating webhook: {e}")
            return None

