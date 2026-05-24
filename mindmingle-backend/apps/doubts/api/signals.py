from django.db.models.signals import m2m_changed, post_save, post_delete
from django.dispatch import receiver
from ..models import Answer, Doubt

@receiver(m2m_changed, sender=Doubt.upvotes.through)
def update_upvotes_count(sender, instance, action, **kwargs):
    if action in ['post_add', 'post_remove', 'post_clear']:  # ✅ add post_clear
        instance.upvotes_count = instance.upvotes.count()
        instance.save(update_fields=['upvotes_count'])        # ✅ only save this field

@receiver(m2m_changed, sender=Doubt.downvotes.through)
def update_downvote_count(sender, instance, action, **kwargs):
    if action in ['post_add', 'post_remove', 'post_clear']:
        instance.downvotes_count = instance.downvotes.count()
        instance.save(update_fields=['downvotes_count'])

@receiver(m2m_changed, sender=Answer.upvotes.through)
def update_answer_upvotes_count(sender, instance, action, **kwargs):
    if action in ['post_add', 'post_remove', 'post_clear']:
        instance.upvotes_count = instance.upvotes.count()
        instance.save(update_fields=['upvotes_count'])

@receiver(m2m_changed, sender=Answer.downvotes.through)
def update_answer_downvotes_count(sender, instance, action, **kwargs):
    if action in ['post_add', 'post_remove', 'post_clear']:
        instance.downvotes_count = instance.downvotes.count()
        instance.save(update_fields=['downvotes_count'])
        
@receiver(post_save, sender=Answer)
def update_answers_count_on_create(sender, instance, created, **kwargs):
    if created:
        Doubt.objects.filter(id=instance.doubt.id).update(
            answers_count=Answer.objects.filter(doubt=instance.doubt).count()
        )

@receiver(post_delete, sender=Answer)
def update_answers_count_on_delete(sender, instance, **kwargs):
    Doubt.objects.filter(id=instance.doubt.id).update(
        answers_count=Answer.objects.filter(doubt=instance.doubt).count()
    )        

@receiver(post_save, sender=Answer)
def handle_answer_accepted_event(sender, instance, created, **kwargs):
    if created:
        return

    # ✅ Detect False → True transition
    if instance.is_accepted and not instance._Answer__original_is_accepted:

        from apps.gamification.api.events import EventDispatcher
        from apps.gamification.api.event_types import ANSWER_ACCEPTED

        EventDispatcher.dispatch(
            ANSWER_ACCEPTED,
            user=instance.author
        )    