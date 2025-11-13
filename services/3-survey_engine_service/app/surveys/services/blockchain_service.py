"""Blockchain service for survey integrity."""
import requests
import os
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class BlockchainService:
    """Service for blockchain operations."""
    
    def __init__(self):
        self.blockchain_service_url = os.getenv("BLOCKCHAIN_SERVICE_URL", "http://blockchain-service:8000")
    
    def store_survey_hash(self, survey_id: str, survey_data: Dict[str, Any]) -> Optional[str]:
        """Store survey hash on blockchain."""
        try:
            response = requests.post(
                f"{self.blockchain_service_url}/api/v1/survey/store",
                json={
                    "survey_id": survey_id,
                    "survey_data": survey_data
                }
            )
            response.raise_for_status()
            data = response.json()
            return data.get("hash")
        except Exception as e:
            logger.error(f"Error storing survey hash: {e}")
            return None
    
    def store_response_hash(self, response_id: str, response_data: Dict[str, Any]) -> Optional[str]:
        """Store response hash on blockchain."""
        try:
            response = requests.post(
                f"{self.blockchain_service_url}/api/v1/response/store",
                json={
                    "response_id": response_id,
                    "response_data": response_data
                }
            )
            response.raise_for_status()
            data = response.json()
            return data.get("hash")
        except Exception as e:
            logger.error(f"Error storing response hash: {e}")
            return None
    
    def verify_survey_integrity(self, survey_id: str, survey_data: Dict[str, Any], stored_hash: str) -> bool:
        """Verify survey integrity."""
        try:
            response = requests.post(
                f"{self.blockchain_service_url}/api/v1/survey/verify",
                params={
                    "survey_id": survey_id,
                    "stored_hash": stored_hash
                },
                json=survey_data
            )
            response.raise_for_status()
            data = response.json()
            return data.get("verified", False)
        except Exception as e:
            logger.error(f"Error verifying survey: {e}")
            return False

