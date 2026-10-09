from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    """Health check endpoint."""
    from django.db import connection
    try:
        with connection.cursor() as cursor: cursor.execute('SELECT 1')
    except Exception:
        return JsonResponse({'status':'unhealthy','service':'survey-engine'},status=503)
    return JsonResponse({'status': 'healthy', 'service': 'survey-engine'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health', health_check, name='health'),
    path('api/v1/survey/', include('app.surveys.apis.urls')),
]

