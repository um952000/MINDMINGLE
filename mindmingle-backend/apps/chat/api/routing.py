# from django.urls import path, include, re_path
# from .consumers import ChatConsumer

# websocket_urlpatterns = [
#     re_path(
#         r'ws/chat/(?P<room_id>\w+)/$',
#         ChatConsumer.as_asgi()
#     ),
# ]

from django.urls import re_path

from .consumers import ChatConsumer, UserNotificationConsumer

websocket_urlpatterns = [

    re_path(
        r'ws/chat/(?P<conversation_id>\w+)/$',
        ChatConsumer.as_asgi()
    ),

    re_path(
        r'ws/notifications/$',
        UserNotificationConsumer.as_asgi()
    )

]