
from rest_framework import serializers

class SolveDoubtSerializer(serializers.Serializer):

    title = serializers.CharField()
    content = serializers.CharField()    