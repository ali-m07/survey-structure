import uuid
from datetime import timedelta
from django.test import TestCase, override_settings
from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from app.surveys.models import Survey, Section, Question, Membership, Submission
from app.surveys.services.validation import validate_structure
from rest_framework.exceptions import ValidationError

class SurveySecurityTests(TestCase):
    def setUp(self):
        self.client=APIClient()
        self.user=User.objects.create_user('owner',password='safe-password-123')
        Membership.objects.create(user=self.user,tenant_id='a',role='admin')
        self.survey=Survey.objects.create(title='Test',tenant_id='a')
        self.section=Section.objects.create(survey=self.survey,title='First')
        self.q=Question.objects.create(section=self.section,question_text='Email',question_type='email',is_required=True)
        self.base='/api/v1/survey/'
    def auth(self): self.client.force_authenticate(self.user)
    def publish(self): self.survey.status='active';self.survey.save()
    def submit(self,answers,response_id=None):
        return self.client.post(self.base+f'public/surveys/{self.survey.id}/submit/',{'response_id':response_id or str(uuid.uuid4()),'answers':answers},format='json')
    def test_tenant_isolation_and_foreign_fk(self):
        other=Survey.objects.create(title='Other',tenant_id='b')
        section=Section.objects.create(survey=other,title='Foreign')
        self.auth()
        self.assertEqual(self.client.get(self.base+f'surveys/{other.id}/').status_code,404)
        self.assertEqual(self.client.post(self.base+'questions/',{'section':section.id,'question_text':'Bad','question_type':'text'},format='json').status_code,400)
    def test_published_source_cannot_be_moved(self):
        self.publish();self.auth()
        draft=Survey.objects.create(title='Draft',tenant_id='a')
        target=Section.objects.create(survey=draft,title='New')
        self.assertEqual(self.client.patch(self.base+f'questions/{self.q.id}/',{'section':target.id},format='json').status_code,400)
        self.assertEqual(self.client.patch(self.base+f'sections/{self.section.id}/',{'survey':draft.id},format='json').status_code,400)
    def test_atomic_validation_and_retry(self):
        self.publish()
        self.assertEqual(self.submit([{'question':self.q.id,'value':'invalid'}]).status_code,400)
        self.assertEqual(Submission.objects.count(),0)
        rid=str(uuid.uuid4())
        data=[{'question':self.q.id,'value':'a@example.com'}]
        first=self.submit(data,rid);second=self.submit(data,rid)
        self.assertEqual(first.status_code,201);self.assertEqual(second.status_code,200)
        self.assertEqual(first.data['id'],second.data['id']);self.assertEqual(Submission.objects.count(),1)
    def test_unavailable_surveys(self):
        self.assertEqual(self.submit([]).status_code,400)
        self.publish();self.survey.ends_at=timezone.now()-timedelta(days=1);self.survey.save()
        self.assertEqual(self.submit([]).status_code,400)
        self.survey.ends_at=None;self.survey.status='closed';self.survey.save()
        self.assertEqual(self.submit([]).status_code,400)
    def test_hidden_required_and_foreign_answers(self):
        self.q.question_type='boolean';self.q.save()
        hidden=Question.objects.create(section=self.section,order=1,question_type='text',question_text='Hidden',is_required=True,validation_rules={'display_if':{'question':self.q.id,'operator':'equals','value':True}})
        self.publish()
        self.assertEqual(self.submit([{'question':self.q.id,'value':False}]).status_code,201)
        self.assertEqual(self.submit([{'question':self.q.id,'value':False},{'question':hidden.id,'value':'forged'}]).status_code,400)
    def test_invalid_logic_fails_publication(self):
        self.q.validation_rules={'display_if':{'question':self.q.id,'operator':'equals','value':'x'}};self.q.save()
        with self.assertRaises(ValidationError): validate_structure(self.survey)
        self.q.validation_rules={'jump_to':{'x':[1]}};self.q.save()
        with self.assertRaises(ValidationError): validate_structure(self.survey)
    def test_invalid_ranking_and_matrix(self):
        self.q.question_type='ranking';self.q.options=['A','B'];self.q.save();self.publish()
        self.assertEqual(self.submit([{'question':self.q.id,'value':['A','A']}]).status_code,400)
        self.assertEqual(self.submit([{'question':self.q.id,'value':['B','A']}]).status_code,201)
        self.q.question_type='matrix';self.q.validation_rules={'rows':['R'],'columns':['C']};self.q.save()
        self.assertEqual(self.submit([{'question':self.q.id,'value':{'R':'wrong'}}]).status_code,400)
    def test_malformed_settings(self):
        self.auth()
        self.assertEqual(self.client.patch(self.base+f'surveys/{self.survey.id}/',{'settings':[]},format='json').status_code,400)

    def test_exports_and_invalid_filter(self):
        self.publish()
        self.assertEqual(self.submit([{'question':self.q.id,'value':'a@example.com'}]).status_code,201)
        self.auth()
        url=self.base+f'surveys/{self.survey.id}/export/'
        for kind,signature in [('csv',bytes([239,187,191])),('xlsx',b'PK'),('pdf',b'%PDF')]:
            response=self.client.get(url,{'format':kind})
            self.assertEqual(response.status_code,200)
            self.assertTrue(response.content.startswith(signature))
        self.assertEqual(self.client.get(url,{'start':'bad'}).status_code,400)
    def test_template_copy_logic_remap(self):
        self.q.question_type='boolean';self.q.save()
        dependent=Question.objects.create(section=self.section,question_text='Dependent',question_type='text',order=1,validation_rules={'display_if':{'question':self.q.id,'operator':'equals','value':True}})
        self.auth()
        template=self.client.post(self.base+'templates/',{'survey':self.survey.id,'name':'Saved'},format='json')
        self.assertEqual(template.status_code,201)
        copied=self.client.post(self.base+f"templates/{template.data['id']}/use/",{},format='json')
        self.assertEqual(copied.status_code,201)
        qs=copied.data['sections'][0]['questions']
        self.assertEqual(qs[1]['validation_rules']['display_if']['question'],qs[0]['id'])
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_invitation_test_transport_is_explicit(self):
        self.publish();self.auth()
        response=self.client.post(self.base+'participants/',{'survey':self.survey.id,'email':'a@example.com'},format='json')
        self.assertEqual(response.status_code,201)
        sent=self.client.post(self.base+f"participants/{response.data['id']}/send_invitation/")
        self.assertEqual(sent.status_code,200)
        self.assertEqual(sent.data['status'],'test_transport')
