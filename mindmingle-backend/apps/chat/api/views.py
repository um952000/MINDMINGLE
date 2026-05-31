# from rest_framework import viewsets, status
# from rest_framework.decorators import action
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

# from .serializers import MessageSerializer, ConversationSerializer
# from ..models import ConversationMember, Message, Conversation
# from apps.core.models import User


# class ConversationViewSet(viewsets.ModelViewSet):
#     serializer_class = ConversationSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         return Conversation.objects.filter(
#             participants=self.request.user
#         ).order_by('-id').distinct()

#     def create(self, request, *args, **kwargs):
#         other_user_id = request.data.get('user_id')
#         if not other_user_id:
#             return Response({"error": "user_id is required"}, status=400)
#         try:
#             other_user = User.objects.get(id=other_user_id)
#         except User.DoesNotExist:
#             return Response({"error": "User not found"}, status=404)

#         existing = Conversation.objects.filter(
#             participants=request.user
#         ).filter(participants=other_user).distinct().first()

#         if existing:
#             return Response(self.get_serializer(existing).data)

#         conversation = Conversation.objects.create()
#         conversation.participants.add(request.user, other_user)
#         return Response(self.get_serializer(conversation).data, status=201)
    
#     @action(detail=True, methods=['delete'])
#     def clear(self, request, pk=None):
#         conversation = self.get_object()
#         conversation.messages.all().delete()
#         return Response(status=204)


# class MessageViewSet(viewsets.ModelViewSet):
#     serializer_class = MessageSerializer
#     permission_classes = [IsAuthenticated]
#     pagination_class = None
#     parser_classes = [MultiPartParser, FormParser, JSONParser]  # ✅ file uploads

#     def get_queryset(self):
#         conversation_id = self.kwargs['conversation_id']
#         return Message.objects.filter(
#             conversation_id=conversation_id,
#             conversation__participants=self.request.user
#         ).order_by('created_at')

#     def perform_create(self, serializer):
#         conversation_id = self.kwargs['conversation_id']
#         conversation = Conversation.objects.get(id=conversation_id)
#         serializer.save(
#             sender=self.request.user,
#             conversation=conversation
#         )
    
#     def destroy(self, request, *args, **kwargs):
#         print("DESTROY METHOD CALLED")
#         instance = self.get_object()
#         if instance.sender != request.user:
#             return Response({"error": "You can only delete your own messages"}, status=403)
#         self.perform_destroy(instance)
#         return Response(status=status.HTTP_204_NO_CONTENT)
    
    
#     def update(self, request, *args, **kwargs):
#         print("UPDATE METHOD CALLED")
#         instance = self.get_object()
#         if instance.sender != request.user:
#             return Response({"error": "You can only edit your own messages"}, status=403)
#         return super().update(request, *args, **kwargs)
        

#     @action(detail=False, methods=['post'], url_path='upload')
#     def upload(self, request, conversation_id=None):
#         try:
#             conversation = Conversation.objects.filter(
#                 id=conversation_id,
#                 participants=request.user
#             ).first()

#             if not conversation:
#                 return Response({"error": "Conversation not found"}, status=404)

#             file = request.FILES.get('file')
#             message_type = request.data.get('message_type', 'image')

#             if not file:
#                 return Response({"error": "No file provided"}, status=400)

#             import cloudinary.uploader

#             resource_type_map = {
#                 'image': 'image',
#                 'video': 'video',
#                 'audio': 'video',
#                 'document': 'raw',  # ✅
#             }

#             resource_type = resource_type_map.get(message_type, 'auto')

#             upload_result = cloudinary.uploader.upload(
#                 file,
#                 resource_type=resource_type,
#                 folder='mindmingle/chat/',
#                 access_mode='public',  # ✅
#             )

#             message = Message.objects.create(
#                 conversation=conversation,
#                 sender=request.user,
#                 message_type=message_type,
#                 content='',
#             )

#             message.file = upload_result['secure_url']
#             message.save()

#             serializer = self.get_serializer(message, context={'request': request})
#             return Response(serializer.data, status=201)

#         except Exception as e:
#             print("UPLOAD ERROR:", str(e))
#             return Response({"error": str(e)}, status=500)



from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone

from .serializers import MessageSerializer, ConversationSerializer
from ..models import ConversationMember, Message, Conversation
from apps.core.models import User

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            members__user=self.request.user,        # ✅ use members instead of participants
            members__is_deleted=False               # ✅ hide deleted ones for this user
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
        ConversationMember.objects.get_or_create(conversation=conversation, user=request.user)
        ConversationMember.objects.get_or_create(conversation=conversation, user=other_user)

        # ✅ notify the other user's notification socket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user_{other_user.id}',
            {
                'type': 'new_conversation',
                'conversation': self.get_serializer(conversation).data
            }
        )

        return Response(self.get_serializer(conversation).data, status=201)
        

    # ✅ clear chat — only for this user, sets cleared_at timestamp
    @action(detail=True, methods=['delete'])
    def clear(self, request, pk=None):
        conversation = self.get_object()
        member, _ = ConversationMember.objects.get_or_create(
            conversation=conversation,
            user=request.user
        )
        member.cleared_at = timezone.now()
        member.save()
        return Response(status=204)

    # ✅ delete chat — only for this user, sets is_deleted flag
    def destroy(self, request, *args, **kwargs):
        conversation = self.get_object()
        member, _ = ConversationMember.objects.get_or_create(
            conversation=conversation,
            user=request.user
        )
        member.is_deleted = True
        member.cleared_at = timezone.now()
        member.save()
        return Response(status=204)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']

        # ✅ filter messages after cleared_at for this user
        try:
            member = ConversationMember.objects.get(
                conversation_id=conversation_id,
                user=self.request.user
            )
            qs = Message.objects.filter(
                conversation_id=conversation_id,
                conversation__participants=self.request.user
            ).order_by('created_at')

            if member.cleared_at:
                qs = qs.filter(created_at__gt=member.cleared_at)

            return qs
        except ConversationMember.DoesNotExist:
            return Message.objects.none()

    def perform_create(self, serializer):
        conversation_id = self.kwargs['conversation_id']
        conversation = Conversation.objects.get(id=conversation_id)
        serializer.save(sender=self.request.user, conversation=conversation)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.sender != request.user:
            return Response({"error": "You can only delete your own messages"}, status=403)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.sender != request.user:
            return Response({"error": "You can only edit your own messages"}, status=403)
        return super().update(request, *args, **kwargs)

    # @action(detail=False, methods=['post'], url_path='upload')
    # def upload(self, request, conversation_id=None):
    #     try:
    #         conversation = Conversation.objects.filter(
    #             id=conversation_id,
    #             participants=request.user
    #         ).first()

    #         if not conversation:
    #             return Response({"error": "Conversation not found"}, status=404)

    #         file = request.FILES.get('file')
    #         message_type = request.data.get('message_type', 'image')

    #         if not file:
    #             return Response({"error": "No file provided"}, status=400)

    #         import cloudinary.uploader

    #         resource_type_map = {
    #             'image': 'image',
    #             'video': 'video',
    #             'audio': 'video',
    #             'document': 'raw',
    #         }

    #         resource_type = resource_type_map.get(message_type, 'auto')

    #         upload_result = cloudinary.uploader.upload(
    #             file,
    #             resource_type=resource_type,
    #             folder='mindmingle/chat/',
    #             access_mode='public',
    #         )

    #         message = Message.objects.create(
    #             conversation=conversation,
    #             sender=request.user,
    #             message_type=message_type,
    #             content='',
    #         )
    #         message.file = upload_result['secure_url']
    #         message.save()

    #         serializer = self.get_serializer(message, context={'request': request})
    #         return Response(serializer.data, status=201)

    #     except Exception as e:
    #         print("UPLOAD ERROR:", str(e))
    #         return Response({"error": str(e)}, status=500)
    
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
                'document': 'raw',
            }

            resource_type = resource_type_map.get(message_type, 'auto')

            upload_result = cloudinary.uploader.upload(
                file,
                resource_type=resource_type,
                folder='mindmingle/chat/',
                access_mode='public',
            )

            # ✅ find deleted members before restoring
            deleted_members = list(
                ConversationMember.objects.filter(
                    conversation=conversation,
                    is_deleted=True
                ).values_list('user_id', flat=True)
            )

            # ✅ only reset is_deleted, keep cleared_at intact
            ConversationMember.objects.filter(
                conversation=conversation
            ).update(is_deleted=False)

            message = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                message_type=message_type,
                content='',
            )
            message.file = upload_result['secure_url']
            message.save()

            # ✅ notify restored users instantly
            if deleted_members:
                from channels.layers import get_channel_layer
                from asgiref.sync import async_to_sync
                from apps.chat.api.serializers import ConversationSerializer

                channel_layer = get_channel_layer()
                conversation_data = ConversationSerializer(
                    conversation,
                    context={'request': request}
                ).data
                for user_id in deleted_members:
                    async_to_sync(channel_layer.group_send)(
                        f'user_{user_id}',
                        {
                            'type': 'new_conversation',
                            'conversation': conversation_data
                        }
                    )

            serializer = self.get_serializer(message, context={'request': request})
            return Response(serializer.data, status=201)

        except Exception as e:
            print("UPLOAD ERROR:", str(e))
            return Response({"error": str(e)}, status=500)