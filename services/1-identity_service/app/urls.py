from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/tenants/', include('app.tenants.apis.urls')),
    path('api/v1/accounts/', include('app.accounts.apis.urls')),
    path('api/v1/integrations/', include('app.integrations.apis.urls')),
    path('api/v1/compliance/', include('app.compliance.apis.urls')),
]

