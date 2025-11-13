from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.workflows.apis.views import (
    WorkflowViewSet, StepViewSet, TriggerViewSet,
    AIConditionViewSet, WorkflowExecutionViewSet
)

router = DefaultRouter()
router.register(r'workflows', WorkflowViewSet)
router.register(r'steps', StepViewSet)
router.register(r'triggers', TriggerViewSet)
router.register(r'ai-conditions', AIConditionViewSet)
router.register(r'executions', WorkflowExecutionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

