from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from urllib.parse import urlencode

class DistributionService:
    def generate_survey_link(self, participant):
        return f"{settings.SURVEY_WEB_URL.rstrip('/')}/survey/{participant.survey_id}?{urlencode({'token':participant.token})}"
    def invite(self, participant):
        link = self.generate_survey_link(participant)
        try:
            sent = send_mail(participant.survey.title, f"{participant.survey.description}\n\n{link}", settings.DEFAULT_FROM_EMAIL, [participant.email], fail_silently=False)
            if sent != 1: raise RuntimeError('Email backend did not accept the message.')
            participant.delivery_status = 'sent' if 'smtp' in settings.EMAIL_BACKEND else 'test_transport'
            participant.delivery_error = ''
            participant.sent_at = timezone.now()
        except Exception as exc:
            participant.delivery_status = 'failed'
            participant.delivery_error = str(exc)[:2000]
        participant.save(update_fields=['delivery_status','delivery_error','sent_at'])
        return link
