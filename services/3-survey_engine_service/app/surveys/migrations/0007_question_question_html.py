from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("surveys", "0006_backfill_audit_scope")]
    operations = [migrations.AddField(model_name="question", name="question_html", field=models.TextField(blank=True, default=""))]
