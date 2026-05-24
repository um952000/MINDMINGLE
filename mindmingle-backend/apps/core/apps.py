from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    
    def ready(self):
        import apps.core.api.signals  # To ensure that the signal handlers are registered when the app is ready, we import the signals module in the ready method of the AppConfig class. This allows us to automatically create a profile for each new user when they are created.
