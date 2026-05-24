from django.apps import AppConfig


class DoubtsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.doubts'
    
    def ready(self):
        import apps.doubts.api.signals