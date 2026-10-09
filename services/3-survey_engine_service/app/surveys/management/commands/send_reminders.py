from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from app.surveys.models import Participant
from app.surveys.services.distribution_service import DistributionService
class Command(BaseCommand):
    help='Send reminders to incomplete invited participants; explicit invocation sends email.'
    def add_arguments(self,parser):
        parser.add_argument('--days',type=int,default=7)
        parser.add_argument('--tenant',required=True)
        parser.add_argument('--survey',type=int,required=True)
        parser.add_argument('--dry-run',action='store_true')
    def handle(self,*args,**options):
        cutoff=timezone.now()-timedelta(days=max(1,options['days']))
        participants=Participant.objects.filter(survey_id=options['survey'],survey__tenant_id=options['tenant'],survey__status='active',completed_at__isnull=True,sent_at__lte=cutoff).exclude(delivery_status='failed')
        for item in participants:
            if options['dry_run']: self.stdout.write(str(item.id))
            else:
                DistributionService().invite(item)
                self.stdout.write(f'{item.id}: {item.delivery_status}')
