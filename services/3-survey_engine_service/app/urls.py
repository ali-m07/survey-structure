from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    """Health check endpoint."""
    return JsonResponse({'status': 'healthy', 'service': 'survey-engine'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health', health_check, name='health'),
    path('api/v1/survey/', include('app.surveys.apis.urls')),
]

