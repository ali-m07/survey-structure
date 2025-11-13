from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.organization.apis.views import (
    DepartmentViewSet, EmployeeViewSet, HierarchyNodeViewSet, SuccessionPlanningViewSet
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'hierarchy-nodes', HierarchyNodeViewSet)
router.register(r'succession-planning', SuccessionPlanningViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

