from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BadgeViewSet,
    UserBadgeViewSet,
    ReputationViewSet,
    UserLevelViewSet,
    LeaderboardViewSet,
)

router = DefaultRouter()
router.register(r'badges',      BadgeViewSet,      basename='badges')
router.register(r'user-badges', UserBadgeViewSet,  basename='user-badges')
router.register(r'reputation',  ReputationViewSet, basename='reputation')
router.register(r'level',       UserLevelViewSet,  basename='level')
router.register(r'leaderboard', LeaderboardViewSet, basename='leaderboard')

urlpatterns = [
    path('', include(router.urls)),
]