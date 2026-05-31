from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from typer import prompt
from .services import generate_ai_answer

from drf_yasg.utils import swagger_auto_schema

from .serializers import SolveDoubtSerializer

class SolveDoubtAPIView(APIView):

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=SolveDoubtSerializer,
        responses={201: SolveDoubtSerializer}
    )
    def post(self, request):

        serializer = SolveDoubtSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        doubt_title = serializer.validated_data['title']
        doubt_content = serializer.validated_data['content']

        answer = generate_ai_answer(doubt_title, doubt_content)

        return Response({
            "answer": answer
        })
        