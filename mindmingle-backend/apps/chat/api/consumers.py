# import json
# from channels.generic.websocket import AsyncJsonWebsocketConsumer
# from channels.db import database_sync_to_async
# from apps.chat.models import Conversation, Message
# from django.contrib.auth import get_user_model

# User = get_user_model()


# class ChatConsumer(AsyncJsonWebsocketConsumer):

#     async def connect(self):
#         self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
#         self.room_group_name = f'chat_{self.conversation_id}'
#         self.user = self.scope["user"]

#         if self.user.is_anonymous:
#             await self.close()
#             return

#         is_participant = await self.user_in_conversation(
#             self.user.id,
#             self.conversation_id
#         )

#         if not is_participant:
#             await self.close()
#             return

#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )
#         await self.accept()
#         print("WebSocket Connected")

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )
#         print("WebSocket Disconnected")

#     async def receive_json(self, data):
#         print("DATA RECEIVED:", data)

#         message_type = data.get('message_type', 'text')

#         # ✅ media message — already saved by REST, just broadcast
#         if message_type in ('image', 'video', 'audio'):
#             message_id = data.get('message_id')
#             if not message_id:
#                 return

#             message = await self.get_message(message_id)
#             if not message:
#                 return

#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'chat_message',
#                     'message': {
#                         'id': message.id,
#                         'content': message.content,
#                         'message_type': message.message_type,
#                         'file': message.file,
#                         'sender': message.sender.id,
#                         'sender_username': message.sender.username,
#                         'created_at': str(message.created_at),
#                         'conversation': int(self.conversation_id),
#                     }
#                 }
#             )
#             return

#         # text message — save and broadcast
#         content = data.get('content')
#         if not content:
#             return

#         user = await self.get_user(self.user.id)
#         message = await self.save_message(user, content)

#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'chat_message',
#                 'message': {
#                     'id': message.id,
#                     'content': message.content,
#                     'message_type': 'text',
#                     'file': None,
#                     'sender': user.id,
#                     'sender_username': user.username,
#                     'created_at': str(message.created_at),
#                     'conversation': int(self.conversation_id),
#                 }
#             }
#         )

#     async def chat_message(self, event):
#         await self.send_json(event['message'])

#     @database_sync_to_async
#     def get_user(self, user_id):
#         return User.objects.get(id=user_id)

#     @database_sync_to_async
#     def get_message(self, message_id):
#         try:
#             return Message.objects.select_related('sender').get(id=message_id)
#         except Message.DoesNotExist:
#             return None

#     @database_sync_to_async
#     def save_message(self, user, content):
#         conversation = Conversation.objects.get(id=self.conversation_id)
#         return Message.objects.create(
#             conversation=conversation,
#             sender=user,
#             content=content,
#             message_type='text'
#         )

#     @database_sync_to_async
#     def user_in_conversation(self, user_id, conversation_id):
#         return Conversation.objects.filter(
#             id=conversation_id,
#             participants__id=user_id
#         ).exists()








# import json
# from channels.generic.websocket import AsyncJsonWebsocketConsumer
# from channels.db import database_sync_to_async
# from apps.chat.models import Conversation, ConversationMember, Message
# from django.contrib.auth import get_user_model

# User = get_user_model()


# class ChatConsumer(AsyncJsonWebsocketConsumer):

#     async def connect(self):
#         self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
#         self.room_group_name = f'chat_{self.conversation_id}'
#         self.user = self.scope["user"]

#         if self.user.is_anonymous:
#             await self.close()
#             return

#         is_participant = await self.user_in_conversation(
#             self.user.id,
#             self.conversation_id
#         )

#         if not is_participant:
#             await self.close()
#             return

#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#         await self.accept()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

#     async def receive_json(self, data):
#         print("DATA RECEIVED:", data)

#         event_type = data.get('type')
#         message_type = data.get('message_type', 'text')

#         # ✅ handle message delete broadcast
#         if event_type == 'message_delete':
#             message_id = data.get('message_id')
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'message_deleted',
#                     'message_id': message_id,
#                 }
#             )
#             return

#         # ✅ handle message edit broadcast
#         if event_type == 'message_edit':
#             message_id = data.get('message_id')
#             content = data.get('content')
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'message_edited',
#                     'message_id': message_id,
#                     'content': content,
#                 }
#             )
#             return

#         # media message — already saved by REST, just broadcast
#         if message_type in ('image', 'video', 'audio', 'document'):
#             message_id = data.get('message_id')
#             if not message_id:
#                 return
#             message = await self.get_message(message_id)
#             if not message:
#                 return
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'chat_message',
#                     'message': {
#                         'id': message.id,
#                         'content': message.content,
#                         'message_type': message.message_type,
#                         'file': message.file,
#                         'sender': message.sender.id,
#                         'sender_username': message.sender.username,
#                         'created_at': str(message.created_at),
#                         'conversation': int(self.conversation_id),
#                     }
#                 }
#             )
#             return

#         # text message — save and broadcast
#         content = data.get('content')
#         if not content:
#             return

#         user = await self.get_user(self.user.id)
#         message = await self.save_message(user, content)

#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'chat_message',
#                 'message': {
#                     'id': message.id,
#                     'content': message.content,
#                     'message_type': 'text',
#                     'file': None,
#                     'sender': user.id,
#                     'sender_username': user.username,
#                     'created_at': str(message.created_at),
#                     'conversation': int(self.conversation_id),
#                 }
#             }
#         )

#     async def chat_message(self, event):
#         await self.send_json(event['message'])

#     # ✅ broadcast delete to all clients in the room
#     async def message_deleted(self, event):
#         await self.send_json({
#             'type': 'message_deleted',
#             'message_id': event['message_id'],
#         })

#     # ✅ broadcast edit to all clients in the room
#     async def message_edited(self, event):
#         await self.send_json({
#             'type': 'message_edited',
#             'id': event['message_id'],
#             'content': event['content'],
#         })

#     @database_sync_to_async
#     def get_user(self, user_id):
#         return User.objects.get(id=user_id)

#     @database_sync_to_async
#     def get_message(self, message_id):
#         try:
#             return Message.objects.select_related('sender').get(id=message_id)
#         except Message.DoesNotExist:
#             return None

#     @database_sync_to_async
#     def save_message(self, user, content):
#         from apps.chat.models import ConversationMember
#         conversation = Conversation.objects.get(id=self.conversation_id)

#         # ✅ find members who had deleted the conversation before restoring
#         deleted_members = list(
#             ConversationMember.objects.filter(
#                 conversation=conversation,
#                 is_deleted=True
#             ).values_list('user_id', flat=True)
#         )

#         # ✅ only reset is_deleted, keep cleared_at intact
#         ConversationMember.objects.filter(
#             conversation=conversation
#         ).update(is_deleted=False)

#         message = Message.objects.create(
#             conversation=conversation,
#             sender=user,
#             content=content,
#             message_type='text'
#         )

#         # ✅ notify restored users via their notification socket
#         from channels.layers import get_channel_layer
#         from asgiref.sync import async_to_sync
#         from apps.chat.api.serializers import ConversationSerializer

#         if deleted_members:
#             channel_layer = get_channel_layer()
#             conversation_data = ConversationSerializer(
#                 conversation,
#                 context={'request': None}
#             ).data
#             for user_id in deleted_members:
#                 async_to_sync(channel_layer.group_send)(
#                     f'user_{user_id}',
#                     {
#                         'type': 'new_conversation',
#                         'conversation': conversation_data
#                     }
#                 )

#         return message
        
           
#     @database_sync_to_async
#     def user_in_conversation(self, user_id, conversation_id):
#         # ✅ only check participation, not is_deleted
#         # is_deleted only hides from list, shouldn't block socket
#         return Conversation.objects.filter(
#             id=conversation_id,
#             participants__id=user_id
#         ).exists()
        
# # consumers.py — add this second consumer

# class UserNotificationConsumer(AsyncJsonWebsocketConsumer):

#     async def connect(self):
#         self.user = self.scope["user"]
#         if self.user.is_anonymous:
#             await self.close()
#             return
#         self.group_name = f'user_{self.user.id}'
#         await self.channel_layer.group_add(self.group_name, self.channel_name)
#         await self.accept()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(self.group_name, self.channel_name)

#     async def receive_json(self, data):
#         pass

#     # ✅ receives new_conversation events and forwards to client
#     async def new_conversation(self, event):
#         await self.send_json({
#             'type': 'new_conversation',
#             'conversation': event['conversation']
#         })        



import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from apps.chat.models import Conversation, Message, ConversationMember
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

        # ✅ only check if participant, ignore is_deleted so socket stays open
        is_participant = await self.user_in_conversation(
            self.user.id,
            self.conversation_id
        )

        if not is_participant:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print("WebSocket Connected")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print("WebSocket Disconnected")

    async def receive_json(self, data):
        print("DATA RECEIVED:", data)

        event_type = data.get('type')
        message_type = data.get('message_type', 'text')

        # ✅ handle message delete broadcast
        if event_type == 'message_delete':
            message_id = data.get('message_id')
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_deleted',
                    'message_id': message_id,
                }
            )
            return

        # ✅ handle message edit broadcast
        if event_type == 'message_edit':
            message_id = data.get('message_id')
            content = data.get('content')
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_edited',
                    'message_id': message_id,
                    'content': content,
                }
            )
            return

        # media message — already saved by REST, just broadcast
        if message_type in ('image', 'video', 'audio', 'document'):
            message_id = data.get('message_id')
            if not message_id:
                return
            message = await self.get_message(message_id)
            if not message:
                return

            # ✅ restore deleted members and notify them
            await self.restore_and_notify(message)

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

    async def message_deleted(self, event):
        await self.send_json({
            'type': 'message_deleted',
            'message_id': event['message_id'],
        })

    async def message_edited(self, event):
        await self.send_json({
            'type': 'message_edited',
            'id': event['message_id'],
            'content': event['content'],
        })

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
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        from apps.chat.api.serializers import ConversationSerializer

        conversation = Conversation.objects.get(id=self.conversation_id)

        # ✅ grab deleted members before restoring
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
            sender=user,
            content=content,
            message_type='text'
        )

        # ✅ notify restored users via notification socket
        if deleted_members:
            channel_layer = get_channel_layer()
            conversation_data = ConversationSerializer(
                conversation,
                context={'request': None}
            ).data
            for user_id in deleted_members:
                async_to_sync(channel_layer.group_send)(
                    f'user_{user_id}',
                    {
                        'type': 'new_conversation',
                        'conversation': conversation_data
                    }
                )

        return message

    @database_sync_to_async
    def restore_and_notify(self, message):
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        from apps.chat.api.serializers import ConversationSerializer

        conversation = Conversation.objects.get(id=self.conversation_id)

        deleted_members = list(
            ConversationMember.objects.filter(
                conversation=conversation,
                is_deleted=True
            ).values_list('user_id', flat=True)
        )

        ConversationMember.objects.filter(
            conversation=conversation
        ).update(is_deleted=False)

        if deleted_members:
            channel_layer = get_channel_layer()
            conversation_data = ConversationSerializer(
                conversation,
                context={'request': None}
            ).data
            for user_id in deleted_members:
                async_to_sync(channel_layer.group_send)(
                    f'user_{user_id}',
                    {
                        'type': 'new_conversation',
                        'conversation': conversation_data
                    }
                )

    @database_sync_to_async
    def user_in_conversation(self, user_id, conversation_id):
        # ✅ only check participation, not is_deleted
        return Conversation.objects.filter(
            id=conversation_id,
            participants__id=user_id
        ).exists()


class UserNotificationConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
        self.group_name = f'user_{self.user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, data):
        pass

    async def new_conversation(self, event):
        await self.send_json({
            'type': 'new_conversation',
            'conversation': event['conversation'],
        })