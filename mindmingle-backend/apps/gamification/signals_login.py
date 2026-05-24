from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver

@receiver(user_logged_in)
def handle_login(sender, request, user, **kwargs):
    from apps.gamification.api.events import EventDispatcher
    from apps.gamification.api.event_types import USER_LOGGED_IN

    EventDispatcher.dispatch(
        USER_LOGGED_IN,
        user=user
    )