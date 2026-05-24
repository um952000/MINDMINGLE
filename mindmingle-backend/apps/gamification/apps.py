# from django.apps import AppConfig


# class GamificationConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'apps.gamification'

#     def ready(self):
#         from apps.gamification.api.events import EventDispatcher
#         from apps.gamification.api.handlers import (
#             handle_doubt_created,
#             handle_answer_created,
#             handle_answer_accepted,
#             handle_upvote,
#             handle_downvote,
#             handle_user_login,
#         )
#         from apps.gamification.api.event_types import (
#             DOUBT_CREATED,
#             ANSWER_CREATED,
#             ANSWER_ACCEPTED,
#             UPVOTE,
#             DOWNVOTE,
#             USER_LOGGED_IN,
#         )

#         EventDispatcher.register(DOUBT_CREATED, handle_doubt_created)
#         EventDispatcher.register(ANSWER_CREATED, handle_answer_created)
#         EventDispatcher.register(ANSWER_ACCEPTED, handle_answer_accepted)
#         EventDispatcher.register(UPVOTE, handle_upvote)
#         EventDispatcher.register(DOWNVOTE, handle_downvote)
#         EventDispatcher.register(USER_LOGGED_IN, handle_user_login)

#         import apps.gamification.signals
#         import apps.gamification.signals_login


# from django.apps import AppConfig

# class GamificationConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'apps.gamification'

#     def ready(self):
#         # ✅ prevent multiple execution
#         if getattr(self, '_initialized', False):
#             return
#         self._initialized = True

#         from apps.gamification.api.events import EventDispatcher
#         from apps.gamification.api.handlers import (
#             handle_doubt_created,
#             handle_answer_created,
#             handle_answer_accepted,
#             handle_upvote,
#             handle_downvote,
#             handle_user_login,
#         )
#         from apps.gamification.api.event_types import (
#             DOUBT_CREATED,
#             ANSWER_CREATED,
#             ANSWER_ACCEPTED,
#             UPVOTE,
#             DOWNVOTE,
#             USER_LOGGED_IN,
#         )

#         EventDispatcher.register(DOUBT_CREATED, handle_doubt_created)
#         EventDispatcher.register(ANSWER_CREATED, handle_answer_created)
#         EventDispatcher.register(ANSWER_ACCEPTED, handle_answer_accepted)
#         EventDispatcher.register(UPVOTE, handle_upvote)
#         EventDispatcher.register(DOWNVOTE, handle_downvote)
#         EventDispatcher.register(USER_LOGGED_IN, handle_user_login)
        
#         print("Gamification ready loaded")

#         import apps.gamification.signals
#         import apps.gamification.signals_login


# apps/gamification/apps.py
import os
from django.apps import AppConfig

class GamificationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.gamification'

    def ready(self):
        # ✅ RUN ONLY IN MAIN SERVER PROCESS
        if os.environ.get('RUN_MAIN') != 'true':
            return

        print("✅ Gamification initialized ONCE (main process only)")

        from apps.gamification.api.events import EventDispatcher
        from apps.gamification.api.handlers import (
            handle_doubt_created,
            handle_answer_created,
            handle_answer_accepted,
            handle_upvote,
            handle_downvote,
            handle_user_login,
        )
        from apps.gamification.api.event_types import (
            DOUBT_CREATED,
            ANSWER_CREATED,
            ANSWER_ACCEPTED,
            UPVOTE,
            DOWNVOTE,
            USER_LOGGED_IN,
        )

        EventDispatcher.register(DOUBT_CREATED, handle_doubt_created)
        EventDispatcher.register(ANSWER_CREATED, handle_answer_created)
        EventDispatcher.register(ANSWER_ACCEPTED, handle_answer_accepted)
        EventDispatcher.register(UPVOTE, handle_upvote)
        EventDispatcher.register(DOWNVOTE, handle_downvote)
        EventDispatcher.register(USER_LOGGED_IN, handle_user_login)

        import apps.gamification.signals
        import apps.gamification.signals_login