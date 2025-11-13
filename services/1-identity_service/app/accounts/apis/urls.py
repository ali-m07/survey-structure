from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.accounts.apis.views import UserViewSet, RoleViewSet, PermissionViewSet, InvitationViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'permissions', PermissionViewSet)
router.register(r'invitations', InvitationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

