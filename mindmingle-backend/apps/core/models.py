from django.db import models
from django.contrib.auth.models import AbstractUser
from django.urls import reverse
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from rest_framework.authtoken.models import Token

from django.db import transaction
from django.db.models import F
 

class User(AbstractUser):
    #To check if the user is an admin or not
    is_admin = models.BooleanField(default=False)
    
    #Profile data
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    reputation = models.IntegerField(default=0)
    skills = models.JSONField(default=list, blank=True)  # List of skills
    is_online = models.BooleanField(default=False)  # To track online status
    last_seen = models.DateTimeField(auto_now=True)  # To track last seen time
    
    followers_count = models.IntegerField(default=0)  # To track number of followers
    following_count = models.IntegerField(default=0)  # To track number of following
    
    is_private = models.BooleanField(default=False)  # To allow users to set their profile as private, which will restrict access to their profile information and posts to only their followers.
    
    class Meta:
        indexes = [
            models.Index(fields=['is_online', 'last_seen']),
            models.Index(fields=['reputation']),
        ]
        
    def __str__(self):
        return self.username
        
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    date_of_birth = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
# class Friendship(models.Model):
    
#     STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('accepted', 'Accepted'),
#         ('rejected', 'Rejected'),
#     ]  # To track the status of the friendship request
    
#     from_user = models.ForeignKey(User, related_name='friendship_requests_sent', on_delete=models.CASCADE)
#     to_user = models.ForeignKey(User, related_name='friendship_requests_received', on_delete=models.CASCADE)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         ordering = ['-created_at']
#         # unique_together = ['from_user', 'to_user'] # To prevent duplicate friendship requests
#         constraints = [
#             models.UniqueConstraint(
#                 fields=['from_user', 'to_user'],
#                 name='unique_friendship'
#             )
#         ]
#         indexes = [
#             models.Index(fields=['from_user', 'to_user']),
#             models.Index(fields=['status', 'created_at']),
#         ]
    
    
#     def accept(self):
#         if self.status != 'pending':
#             return

#         with transaction.atomic():
#             self.status = 'accepted'
#             self.save(update_fields=['status'])

#             User.objects.filter(id=self.from_user.id).update(
#                 following_count=F('following_count') + 1
#             )

#             User.objects.filter(id=self.to_user.id).update(
#                 followers_count=F('followers_count') + 1
#             )
        
#     # def reject(self):
#     #     self.status = 'rejected'
#     #     self.save()
        
#     #     #delete reverse friendship if exists
#     #     Friendship.objects.filter(
#     #         from_user=self.to_user,
#     #         to_user=self.from_user
#     #     ).delete()
    
#     def reject(self):
#         self.delete()  # To delete the friendship request instead of marking it as rejected, we can simply call the delete() method on the Friendship instance. This will remove the record from the database, effectively rejecting the request without leaving any trace of it.
        
#     def __str__(self):
#         return f"{self.from_user.username} -> {self.to_user.username} ({self.status})"
    
class Friendship(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    from_user = models.ForeignKey(
        'User', related_name='friendship_requests_sent', on_delete=models.CASCADE
    )
    to_user = models.ForeignKey(
        'User', related_name='friendship_requests_received', on_delete=models.CASCADE
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['from_user', 'to_user'], name='unique_friendship')
        ]

    def accept(self):
        """Accept a pending friendship (private user only)"""
        if self.status != 'pending':
            return
        with transaction.atomic():
            self.status = 'accepted'
            self.save(update_fields=['status'])

            # Update counters
            self.from_user.__class__.objects.filter(
                id=self.from_user.id
            ).update(following_count=F('following_count') + 1)
            self.to_user.__class__.objects.filter(
                id=self.to_user.id
            ).update(followers_count=F('followers_count') + 1)

    def reject(self):
        """Reject a pending friendship (private user only)"""
        if self.status != 'pending':
            return
        self.status = 'rejected'
        self.save()    