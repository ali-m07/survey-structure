"""Distribution service for survey invitations."""
import secrets
import string
from typing import Optional
from django.conf import settings
from app.surveys.models import Participant
import logging

logger = logging.getLogger(__name__)


class DistributionService:
    """Service for distributing surveys."""
    
    def generate_survey_link(self, participant: Participant) -> str:
        """Generate unique survey link for participant."""
        base_url = getattr(settings, 'SURVEY_BASE_URL', 'http://localhost:3000')
        return f"{base_url}/survey/{participant.survey.id}?token={participant.token}"
    
    def generate_qr_code(self, participant: Participant) -> str:
        """Generate QR code data for survey link."""
        survey_link = self.generate_survey_link(participant)
        # In production, use a QR code library like qrcode
        return survey_link
    
    def send_sms_invitation(self, participant: Participant, phone_number: str) -> bool:
        """Send SMS invitation."""
        try:
            # Integration with Twilio or similar service
            survey_link = self.generate_survey_link(participant)
            # SMS sending logic here
            logger.info(f"SMS sent to {phone_number} for survey {participant.survey.id}")
            return True
        except Exception as e:
            logger.error(f"Error sending SMS: {e}")
            return False
    
    def generate_unique_token(self) -> str:
        """Generate unique token for participant."""
        return secrets.token_urlsafe(32)

