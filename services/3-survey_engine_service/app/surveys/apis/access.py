from rest_framework.exceptions import PermissionDenied, ValidationError
from app.surveys.models import Membership, AuditEvent

def tenant(request, write=False):
    memberships = Membership.objects.filter(user=request.user)
    selected = request.headers.get('X-Tenant-ID') or request.query_params.get('tenant_id')
    member = memberships.filter(tenant_id=selected).first() if selected else memberships.order_by('id').first()
    if not member:
        raise PermissionDenied('No membership in this organization.')
    if write and member.role == 'viewer':
        raise PermissionDenied('This role is read only.')
    return member.tenant_id

def editable(survey):
    if survey.status != 'draft':
        raise ValidationError('Published structures are immutable. Duplicate the survey to edit it.')

def audit(request, verb, obj):
    survey = obj if obj._meta.model_name=='survey' else getattr(obj,'survey',None) or (obj.section.survey if hasattr(obj,'section') else None)
    AuditEvent.objects.create(tenant_id=tenant(request), user=request.user, action=verb, object_id=str(obj.pk),detail={'model':obj._meta.model_name,'survey_id':survey.id if survey else None})
