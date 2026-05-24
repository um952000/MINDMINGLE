from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ConversationViewSet, MessageViewSet

router = DefaultRouter()

router.register(
    r'conversations',
    ConversationViewSet,
    basename='conversation'
)

urlpatterns = [

    # router urls
    path('', include(router.urls)),

    # messages of specific conversation
    path(
        'conversations/<int:conversation_id>/messages/',
        MessageViewSet.as_view({
            'get': 'list',
            'post': 'create'
        }),
        name='conversation-messages'
    ),

    path(
        'conversations/<int:conversation_id>/messages/<int:pk>/',
        MessageViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        }),
        name='conversation-message-detail'
    ),
    
    path(
        'conversations/<int:conversation_id>/messages/upload/',
        MessageViewSet.as_view({
            'post': 'upload'
        }),
        name='conversation-messages-upload'
    ),
]