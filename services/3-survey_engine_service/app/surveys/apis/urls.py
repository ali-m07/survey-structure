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
from .extras import templates, use_template, members, member_detail, webhooks, webhook_detail
from .public import public_survey, submit

urlpatterns = [
    path('templates/', templates),
    path('templates/<int:pk>/use/', use_template),
    path('members/', members),
    path('members/<int:pk>/', member_detail),
    path('surveys/<int:pk>/webhooks/', webhooks),
    path('webhooks/<int:pk>/', webhook_detail),
    path('public/surveys/<int:pk>/', public_survey),
    path('public/surveys/<int:pk>/submit/', submit),
    path('auth/login/', login),
    path('auth/me/', me),
    path('auth/logout/', logout),
    path('', include(router.urls)),
]

