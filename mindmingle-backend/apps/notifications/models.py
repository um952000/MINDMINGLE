from django.db import models


class Notification(models.Model):
     TYPE_CHOICES = [
        ('friend_request', 'Friend Request'),
        ('friend_accepted', 'Friend Accepted'),
        ('new_answer', 'New Answer'),
        ('doubt_liked', 'Doubt Liked'),
        ('answer_accepted', 'Answer Accepted'),
        ('mentioned', 'Mentioned'),
        ('badge_earned', 'Badge Earned'),
    ]
     
     user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='notifications')
     actor = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='actions') # The user who triggered the notification
     notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
     message = models.CharField(max_length=255) # A human-readable message for the notification
     is_read = models.BooleanField(default=False)
     created_at = models.DateTimeField(auto_now_add=True)
     
     class Meta:
        indexes = [models.Index(fields=['user', 'is_read', '-created_at'])]
        
class ChatMessage(models.Model):
    chat_id = models.CharField(max_length=255)  # Unique identifier for the chat session
    sender = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [models.Index(fields=['chat_id', 'created_at'])]        