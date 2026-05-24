from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from drf_yasg.utils import swagger_auto_schema

from .serializers import SolveDoubtSerializer

from langchain_huggingface import (
    HuggingFaceEndpoint,
    ChatHuggingFace
)


class SolveDoubtAPIView(APIView):

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=SolveDoubtSerializer,
        responses={201: SolveDoubtSerializer}
    )
    def post(self, request):

        serializer = SolveDoubtSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data['prompt']

        llm = HuggingFaceEndpoint(
            repo_id="deepseek-ai/DeepSeek-R1",
            task="text-generation"
        )

        model = ChatHuggingFace(llm=llm)

        result = model.invoke(prompt)

        return Response({
            "answer": result.content
        })
        