from django.core.management.base import BaseCommand
from app.surveys.models import WebhookDelivery
from app.surveys.services.webhooks import deliver
class Command(BaseCommand):
    help='Deliver pending/failed webhooks; schedule regularly. Each delivery has a stable ID and at most five attempts.'
    def handle(self,*args,**kwargs):
        for item in WebhookDelivery.objects.exclude(status='delivered').filter(attempts__lt=5,webhook__enabled=True).order_by('id')[:100]: deliver(item)
