# """
# ASGI config for mindmingle project.

# It exposes the ASGI callable as a module-level variable named ``application``.

# For more information on this file, see
# https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
# """

# import os


# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from django.core.asgi import get_asgi_application

# import apps.chat.api.routing

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindmingle.settings')

# # application = get_asgi_application()

# application = ProtocolTypeRouter({
    
#     # Django's ASGI application to handle traditional HTTP requests
#     "http": get_asgi_application(),

#     # WebSocket handler using AuthMiddlewareStack to manage user authentication
#     "websocket": AuthMiddlewareStack(
#         URLRouter(
#             apps.chat.api.routing.websocket_urlpatterns
#         )
#     ),
# })


# import os

# from django.core.asgi import get_asgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindmingle.settings')

# django_asgi_app = get_asgi_application()

# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from apps.chat.api.routing import websocket_urlpatterns

# application = ProtocolTypeRouter({
#     "http": django_asgi_app,

#     "websocket": AuthMiddlewareStack(
#         URLRouter(
#             websocket_urlpatterns
#         )
#     ),
# })



import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindmingle.settings')

import django
django.setup()  # ✅ ADD THIS — must be before any app imports

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from apps.chat.api.routing import websocket_urlpatterns
from apps.chat.api.jwt_middleware import JWTAuthMiddleware

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})