import secrets
from django.contrib.auth.models import User
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from app.surveys.models import Survey, Section, Question, SurveyTemplate, Membership, Webhook
from .access import tenant
from .serializers import SurveySerializer

def admin(request):
    org=tenant(request,True)
    if not Membership.objects.filter(user=request.user,tenant_id=org,role='admin').exists(): raise PermissionDenied('Administrator role required.')
    return org

@api_view(['GET','POST'])
def templates(request):
    org=tenant(request,request.method=='POST')
    if request.method=='GET': return Response(list(SurveyTemplate.objects.filter(tenant_id=org).values('id','name','created_at')))
    survey=get_object_or_404(Survey,pk=request.data.get('survey'),tenant_id=org)
    obj=SurveyTemplate.objects.create(tenant_id=org,name=request.data.get('name') or survey.title,structure=SurveySerializer(survey).data)
    return Response({'id':obj.id,'name':obj.name},status=201)

@api_view(['POST'])
@transaction.atomic
def use_template(request,pk):
    org=tenant(request,True);template=get_object_or_404(SurveyTemplate,pk=pk,tenant_id=org);data=template.structure
    survey=Survey.objects.create(tenant_id=org,title=request.data.get('title') or template.name,description=data.get('description',''),settings=data.get('settings',{}),created_by_id=str(request.user.id))
    remap={}
    for section in data['sections']:
        new_section=Section.objects.create(survey=survey,title=section['title'],description=section.get('description',''),order=section['order'])
        for q in section['questions']:
            new=Question.objects.create(section=new_section,**{k:q[k] for k in ('question_text','question_type','is_required','order','options','validation_rules')});remap[q['id']]=new.id
    for q in Question.objects.filter(section__survey=survey):
        rules=q.validation_rules
        if rules.get('display_if'): rules['display_if']['question']=remap.get(rules['display_if']['question'])
        if rules.get('jump_to'): rules['jump_to']={k:remap.get(v) for k,v in rules['jump_to'].items()}
        for old,new in remap.items(): q.question_text=q.question_text.replace('{{'+str(old)+'}}','{{'+str(new)+'}}')
        q.validation_rules=rules;q.save()
    return Response(SurveySerializer(survey).data,status=201)

@api_view(['GET','POST'])
def members(request):
    org=tenant(request) if request.method=='GET' else admin(request)
    if request.method=='GET': return Response(list(Membership.objects.filter(tenant_id=org).values('id','user__username','role')))
    username=request.data.get('username');role=request.data.get('role','editor')
    if role not in ('admin','editor','viewer'): raise ValidationError('Invalid role.')
    user=get_object_or_404(User,username=username)
    current=Membership.objects.filter(user=user,tenant_id=org).first()
    if current and current.role=='admin' and role!='admin' and Membership.objects.filter(tenant_id=org,role='admin').count()<=1: raise ValidationError('Cannot demote the last administrator.')
    obj,_=Membership.objects.update_or_create(user=user,tenant_id=org,defaults={'role':role})
    return Response({'id':obj.id,'username':user.username,'role':role},status=201)

@api_view(['DELETE'])
def member_detail(request,pk):
    org=admin(request);obj=get_object_or_404(Membership,pk=pk,tenant_id=org)
    if obj.role=='admin' and Membership.objects.filter(tenant_id=org,role='admin').count()<=1: raise ValidationError('Cannot remove the last administrator.')
    obj.delete();return Response(status=204)

@api_view(['GET','POST'])
def webhooks(request,pk):
    org=admin(request) if request.method=='POST' else tenant(request)
    survey=get_object_or_404(Survey,pk=pk,tenant_id=org)
    if request.method=='GET': return Response(list(survey.webhooks.values('id','url','enabled')))
    from app.surveys.services.webhooks import validate_url
    url=request.data.get('url');validate_url(url)
    obj=Webhook.objects.create(survey=survey,url=url,secret=secrets.token_hex(32))
    return Response({'id':obj.id,'url':obj.url,'enabled':True,'secret':obj.secret},status=201)

@api_view(['GET','POST','DELETE'])
def webhook_detail(request,pk):
    org=admin(request);obj=get_object_or_404(Webhook,pk=pk,survey__tenant_id=org)
    if request.method=='DELETE': obj.delete();return Response(status=204)
    if request.method=='POST':
        from app.surveys.services.webhooks import deliver
        for delivery in obj.deliveries.exclude(status='delivered').filter(attempts__lt=5): deliver(delivery)
    return Response(list(obj.deliveries.order_by('-created_at').values('id','submission_id','status','attempts','error','created_at','delivered_at')[:100]))
