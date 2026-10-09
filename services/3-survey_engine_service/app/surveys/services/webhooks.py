import hashlib,hmac,json,socket,ipaddress
import requests
from urllib.parse import urlparse
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from app.surveys.models import WebhookDelivery

def validate_url(url):
    try:
        parsed=urlparse(url)
        if parsed.scheme!='https' or not parsed.hostname or parsed.username or parsed.password: raise ValueError()
        addresses=socket.getaddrinfo(parsed.hostname,parsed.port or 443,type=socket.SOCK_STREAM)
        if any(not ipaddress.ip_address(item[4][0]).is_global for item in addresses): raise ValueError()
    except Exception: raise ValidationError('Webhook requires a reachable public HTTPS URL.')

def deliver(delivery):
    hook=delivery.webhook;delivery.attempts+=1
    try:
        validate_url(hook.url)
        payload=json.dumps({'event':'submission.completed','delivery_id':delivery.id,'survey_id':delivery.submission.survey_id,'submission_id':delivery.submission_id,'answers':list(delivery.submission.answers.values('question_id','answer_value'))},ensure_ascii=False).encode('utf-8')
        signature=hmac.new(hook.secret.encode(),payload,hashlib.sha256).hexdigest()
        response=requests.post(hook.url,data=payload,headers={'Content-Type':'application/json','X-Survey-Signature':signature},timeout=8,allow_redirects=False)
        if not 200<=response.status_code<300: raise RuntimeError(f'HTTP {response.status_code}')
        delivery.status='delivered';delivery.error='';delivery.delivered_at=timezone.now()
    except Exception as exc: delivery.status='failed';delivery.error=str(exc)[:2000]
    delivery.save(update_fields=['attempts','status','error','delivered_at'])

def enqueue(submission):
    for hook in submission.survey.webhooks.filter(enabled=True): WebhookDelivery.objects.get_or_create(webhook=hook,submission=submission)
