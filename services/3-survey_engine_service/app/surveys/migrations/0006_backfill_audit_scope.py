from django.db import migrations

def backfill(apps, schema_editor):
    AuditEvent = apps.get_model('surveys','AuditEvent')
    Survey = apps.get_model('surveys','Survey')
    Section = apps.get_model('surveys','Section')
    Question = apps.get_model('surveys','Question')
    for event in AuditEvent.objects.all().iterator():
        detail = event.detail if isinstance(event.detail,dict) else {}
        if detail.get('survey_id') is not None:
            continue
        kind = detail.get('model') or event.action.rsplit('.',1)[-1]
        if kind not in ('survey','section','question'):
            continue
        try:
            object_id = int(event.object_id)
        except (ValueError,TypeError):
            continue
        survey_id = None
        if kind == 'survey':
            survey_id = Survey.objects.filter(pk=object_id,tenant_id=event.tenant_id).values_list('id',flat=True).first()
        elif kind == 'section':
            survey_id = Section.objects.filter(pk=object_id,survey__tenant_id=event.tenant_id).values_list('survey_id',flat=True).first()
        elif kind == 'question':
            survey_id = Question.objects.filter(pk=object_id,section__survey__tenant_id=event.tenant_id).values_list('section__survey_id',flat=True).first()
        # A deleted or mismatched source cannot safely be assigned from its numeric ID.
        if survey_id is not None:
            event.detail = {**detail,'model':kind,'survey_id':survey_id}
            event.save(update_fields=['detail'])

class Migration(migrations.Migration):
    dependencies = [('surveys','0005_surveytemplate_webhook_webhookdelivery')]
    operations = [migrations.RunPython(backfill,migrations.RunPython.noop)]
