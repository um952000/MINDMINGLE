from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.viewsets import ModelViewSet
from .serializers import DoubtSerializer
from ..models import Doubt

class DoubtViewSet(ModelViewSet):
    queryset = Doubt.objects.all()
    serializer_class = DoubtSerializer
    parser_classes = [MultiPartParser, FormParser]