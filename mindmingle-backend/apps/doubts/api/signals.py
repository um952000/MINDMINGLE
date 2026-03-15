from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from ..models import Answer, Doubt

@receiver(m2m_changed, sender=Doubt.upvotes.through)
def update_upvotes_count(sender, instance, action, **kwargs):
    if action in ["post_add", "post_remove"]:
        instance.upvotes_count = instance.upvotes.count()
        instance.save()

@receiver(m2m_changed, sender=Doubt.downvotes.through)
def update_downvote_count(sender, instance, action, **kwargs):
    if action in ["post_add", "post_remove"]:
        instance.downvotes_count = instance.downvotes.count()
        instance.save()        

@receiver(m2m_changed, sender=Answer.upvotes.through)
def update_answer_upvotes_count(sender, instance, action, **kwargs):

    if action in ["post_add", "post_remove"]:
        instance.upvotes_count = instance.upvotes.count()
        instance.save()        


@receiver(m2m_changed, sender=Answer.downvotes.through)
def update_answer_downvotes_count(sender, instance, action, **kwargs):

    if action in ["post_add", "post_remove"]:
        instance.downvotes_count = instance.downvotes.count()
        instance.save()        