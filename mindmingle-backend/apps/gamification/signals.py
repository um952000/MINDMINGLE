from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.core.models import User
from .models import UserLevel

@receiver(post_save, sender=User)
def create_user_level(sender, instance, created, **kwargs):
    if created:
        UserLevel.objects.create(user=instance)