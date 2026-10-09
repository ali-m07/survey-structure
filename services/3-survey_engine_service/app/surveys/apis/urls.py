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

from .views import login, me, logout
from .public import public_survey, submit

urlpatterns = [
    path('public/surveys/<int:pk>/', public_survey),
    path('public/surveys/<int:pk>/submit/', submit),
    path('auth/login/', login),
    path('auth/me/', me),
    path('auth/logout/', logout),
    path('', include(router.urls)),
]

