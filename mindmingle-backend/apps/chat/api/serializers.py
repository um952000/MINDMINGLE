from rest_framework import serializers
from ..models import Message, Conversation


class MessageSerializer(serializers.ModelSerializer):

    sender_username = serializers.CharField(
        source='sender.username',
        read_only=True
    )
    
    # file_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id',
            'sender_username',
            'content',
            'message_type',
            'file',
            # 'file_url',
            'is_seen',
            'created_at',
            'conversation',  
            'sender'
        ]
        read_only_fields = [
            'sender',
            'conversation',  
            'created_at',
            'sender_username',
            'file_url'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None    


class ConversationSerializer(serializers.ModelSerializer):

    name = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id',
            'participants',
            'created_at',
            'name'
        ]

    def get_name(self, obj):
        request = self.context.get('request')
        current_user = request.user

        other_user = obj.participants.exclude(id=current_user.id).first()

        return other_user.username if other_user else "Conversation"