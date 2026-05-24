
from rest_framework import serializers

class SolveDoubtSerializer(serializers.Serializer):

    prompt = serializers.CharField()    