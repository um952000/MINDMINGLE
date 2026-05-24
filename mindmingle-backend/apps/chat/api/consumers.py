import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from apps.chat.models import Conversation, Message
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        is_participant = await self.user_in_conversation(
            self.user.id,
            self.conversation_id
        )

        if not is_participant:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        print("WebSocket Connected")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print("WebSocket Disconnected")

    async def receive_json(self, data):
        print("DATA RECEIVED:", data)

        message_type = data.get('message_type', 'text')

        # ✅ media message — already saved by REST, just broadcast
        if message_type in ('image', 'video', 'audio'):
            message_id = data.get('message_id')
            if not message_id:
                return

            message = await self.get_message(message_id)
            if not message:
                return

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': message.id,
                        'content': message.content,
                        'message_type': message.message_type,
                        'file': message.file,
                        'sender': message.sender.id,
                        'sender_username': message.sender.username,
                        'created_at': str(message.created_at),
                        'conversation': int(self.conversation_id),
                    }
                }
            )
            return

        # text message — save and broadcast
        content = data.get('content')
        if not content:
            return

        user = await self.get_user(self.user.id)
        message = await self.save_message(user, content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': message.id,
                    'content': message.content,
                    'message_type': 'text',
                    'file': None,
                    'sender': user.id,
                    'sender_username': user.username,
                    'created_at': str(message.created_at),
                    'conversation': int(self.conversation_id),
                }
            }
        )

    async def chat_message(self, event):
        await self.send_json(event['message'])

    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)

    @database_sync_to_async
    def get_message(self, message_id):
        try:
            return Message.objects.select_related('sender').get(id=message_id)
        except Message.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, user, content):
        conversation = Conversation.objects.get(id=self.conversation_id)
        return Message.objects.create(
            conversation=conversation,
            sender=user,
            content=content,
            message_type='text'
        )

    @database_sync_to_async
    def user_in_conversation(self, user_id, conversation_id):
        return Conversation.objects.filter(
            id=conversation_id,
            participants__id=user_id
        ).exists()