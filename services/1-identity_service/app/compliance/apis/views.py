from rest_framework import viewsets
from app.compliance.models import ConsentLog, DataResidencyConfig, AuditTrail
from app.compliance.apis.serializers import ConsentLogSerializer, DataResidencyConfigSerializer, AuditTrailSerializer


class ConsentLogViewSet(viewsets.ModelViewSet):
    queryset = ConsentLog.objects.all()
    serializer_class = ConsentLogSerializer


class DataResidencyConfigViewSet(viewsets.ModelViewSet):
    queryset = DataResidencyConfig.objects.all()
    serializer_class = DataResidencyConfigSerializer


class AuditTrailViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditTrail.objects.all()
    serializer_class = AuditTrailSerializer

