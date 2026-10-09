import time
from datetime import timedelta
from django.core.management.base import BaseCommand,CommandError
from django.conf import settings
from django.utils import timezone
from app.surveys.models import WebhookDelivery,Participant
from app.surveys.services.webhooks import deliver
from app.surveys.services.distribution_service import DistributionService
class Command(BaseCommand):
    help='Run persisted webhook and opt-in reminder jobs.'
    def add_arguments(self,parser):
        parser.add_argument('--once',action='store_true')
        parser.add_argument('--interval',type=int,default=30)
    def handle(self,*args,**options):
        if options['interval']<5: raise CommandError('Interval must be at least five seconds.')
        while True:
            try:
                for item in WebhookDelivery.objects.exclude(status='delivered').filter(attempts__lt=5,webhook__enabled=True).order_by('id')[:100]: deliver(item)
                for item in Participant.objects.filter(completed_at__isnull=True,survey__status='active',survey__settings__reminders_enabled=True).exclude(delivery_status='failed')[:100]:
                    days=item.survey.settings.get('reminder_days',7)
                    if not isinstance(days,int) or days<1: continue
                    if item.sent_at and item.sent_at<timezone.now()-timedelta(days=days): DistributionService().invite(item)
                self.stdout.write('Survey job cycle complete.')
            except Exception as exc: self.stderr.write(f'Survey job cycle failed: {exc}')
            if options['once']: break
            time.sleep(options['interval'])
