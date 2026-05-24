from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .serializers import MessageSerializer, ConversationSerializer
from ..models import Message, Conversation
from apps.core.models import User


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).order_by('-id').distinct()

    def create(self, request, *args, **kwargs):
        other_user_id = request.data.get('user_id')
        if not other_user_id:
            return Response({"error": "user_id is required"}, status=400)
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        existing = Conversation.objects.filter(
            participants=request.user
        ).filter(participants=other_user).distinct().first()

        if existing:
            return Response(self.get_serializer(existing).data)

        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, other_user)
        return Response(self.get_serializer(conversation).data, status=201)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # ✅ file uploads

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        return Message.objects.filter(
            conversation_id=conversation_id,
            conversation__participants=self.request.user
        ).order_by('created_at')

    def perform_create(self, serializer):
        conversation_id = self.kwargs['conversation_id']
        conversation = Conversation.objects.get(id=conversation_id)
        serializer.save(
            sender=self.request.user,
            conversation=conversation
        )

    @action(detail=False, methods=['post'], url_path='upload')
    def upload(self, request, conversation_id=None):
        try:
            conversation = Conversation.objects.filter(
                id=conversation_id,
                participants=request.user
            ).first()

            if not conversation:
                return Response({"error": "Conversation not found"}, status=404)

            file = request.FILES.get('file')
            message_type = request.data.get('message_type', 'image')

            if not file:
                return Response({"error": "No file provided"}, status=400)

            import cloudinary.uploader

            resource_type_map = {
                'image': 'image',
                'video': 'video',
                'audio': 'video',
                'document': 'raw',  # ✅
            }

            resource_type = resource_type_map.get(message_type, 'auto')

            upload_result = cloudinary.uploader.upload(
                file,
                resource_type=resource_type,
                folder='mindmingle/chat/',
                access_mode='public',  # ✅
            )

            message = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                message_type=message_type,
                content='',
            )

            message.file = upload_result['secure_url']
            message.save()

            serializer = self.get_serializer(message, context={'request': request})
            return Response(serializer.data, status=201)

        except Exception as e:
            print("UPLOAD ERROR:", str(e))
            return Response({"error": str(e)}, status=500)