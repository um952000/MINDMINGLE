# from django.db import models
# from django.conf import settings   #✅ import settings to access AUTH_USER_MODEL
# from django.utils import timezone

# class Conversation(models.Model):
#     participants = models.ManyToManyField(
#         settings.AUTH_USER_MODEL,  # ✅ string reference, safe at import time
#         related_name='conversations'
#     )

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Conversation {self.id}"

# class Message(models.Model):
    
#     MESSAGE_TYPES = [
#         ('text', 'Text'),
#         ('image', 'Image'),
#         ('video', 'Video'),
#         ('audio', 'Audio'),
#         ('document', 'Document'),
#     ]

#     conversation = models.ForeignKey(
#         Conversation, related_name='messages', on_delete=models.CASCADE
#     )
#     sender = models.ForeignKey(
#         settings.AUTH_USER_MODEL, related_name='messages', on_delete=models.CASCADE
#     )
#     content = models.TextField(blank=True)
#     message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
#     file = models.URLField(max_length=500, null=True, blank=True)  # ✅ store URL directly
#     is_seen = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         ordering = ['created_at']


from django.db import models
from django.conf import settings   #✅ import settings to access AUTH_USER_MODEL
from django.utils import timezone

class Conversation(models.Model):
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,  # ✅ string reference, safe at import time
        related_name='conversations'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation {self.id}"

class ConversationMember(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='members', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='conversation_members', on_delete=models.CASCADE)
    
    is_deleted = models.BooleanField(default=False)  # ✅ flag to indicate if the user has left the conversation
    cleared_at = models.DateTimeField(null=True, blank=True)  # ✅ timestamp for when the conversation was cleared

    class Meta:
        unique_together = ('conversation', 'user')
        
    def __str__(self):
        return f"{self.user.username} in Conversation {self.conversation.id}"    

class Message(models.Model):
    
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('document', 'Document'),
    ]

    conversation = models.ForeignKey(
        Conversation, related_name='messages', on_delete=models.CASCADE
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='messages', on_delete=models.CASCADE
    )
    content = models.TextField(blank=True)
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    file = models.URLField(max_length=500, null=True, blank=True)  # ✅ store URL directly
    is_seen = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']