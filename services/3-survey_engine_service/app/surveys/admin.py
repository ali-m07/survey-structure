from django.contrib import admin
from app.surveys.models import Survey, Section, Question, Participant, Submission, Answer

admin.site.register(Survey)
admin.site.register(Section)
admin.site.register(Question)
admin.site.register(Participant)
admin.site.register(Submission)
admin.site.register(Answer)

