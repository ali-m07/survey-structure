from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.surveys.apis.views import (
    SurveyViewSet, SectionViewSet, QuestionViewSet,
    ParticipantViewSet, SubmissionViewSet, AnswerViewSet,
    RealTimeResponseViewSet, DEIQuestionSetViewSet
)

router = DefaultRouter()
router.register(r'surveys', SurveyViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'participants', ParticipantViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'answers', AnswerViewSet)
router.register(r'realtime-responses', RealTimeResponseViewSet)
router.register(r'dei-question-sets', DEIQuestionSetViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

