from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from ..models import Badge, UserBadge, Reputation, UserLevel, Leaderboard
from .serializers import (
    BadgeSerializer, UserBadgeSerializer,
    ReputationSerializer, UserLevelSerializer,
    LeaderboardSerializer
)


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve all available badges"""
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'


class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """List badges earned by the logged in user"""
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        
        if(getattr(self, 'swagger_fake_view', False)):
            return UserBadge.objects.none()
        
        return UserBadge.objects.filter(
            user=self.request.user
        ).select_related('badge', 'user')

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def user_badges(self, request, user_id=None):
        """Get badges for any user by ID"""
        badges = UserBadge.objects.filter(
            user_id=user_id
        ).select_related('badge', 'user')
        serializer = self.get_serializer(badges, many=True)
        return Response(serializer.data)


class ReputationViewSet(viewsets.ReadOnlyModelViewSet):
    """Reputation history for logged in user"""
    serializer_class = ReputationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        
        if getattr(self, 'swagger_fake_view', False):
            return Reputation.objects.none()
        
        return Reputation.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Get reputation summary for logged in user"""
        try:
            user_level = UserLevel.objects.get(user=request.user)
            return Response({
                'total_reputation': user_level.total_reputation,
                'level': user_level.level,
                'streak_days': user_level.streak_days,
            })
        except UserLevel.DoesNotExist:
            return Response({
                'total_reputation': 0,
                'level': 'Beginner',
                'streak_days': 0,
            })


class UserLevelViewSet(viewsets.ReadOnlyModelViewSet):
    """User level and stats"""
    serializer_class = UserLevelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        
        if getattr(self, 'swagger_fake_view', False):
            return UserLevel.objects.none()
        
        return UserLevel.objects.select_related(
            'user'
        ).prefetch_related(
            'user__user_badges__badge',
            'user__reputation_logs',
        )

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """Get logged in user's level and stats"""
        user_level, _ = UserLevel.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(user_level)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='me/streak')
    def update_streak(self, request):
        """Update streak for logged in user"""
        user_level, _ = UserLevel.objects.get_or_create(user=request.user)
        user_level.update_streak()
        return Response({
            'streak_days': user_level.streak_days,
            'last_active_date': user_level.last_active_date,
        })


class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    """Leaderboard for all periods"""
    serializer_class = LeaderboardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        period = self.request.query_params.get('period', 'all_time')
        return Leaderboard.objects.filter(
            period=period
        ).select_related(
            'user', 'user__user_level'
        ).order_by('rank')

    @action(detail=False, methods=['get'], url_path='my-rank')
    def my_rank(self, request):
        """Get logged in user's rank for a period"""
        period = request.query_params.get('period', 'all_time')
        try:
            entry = Leaderboard.objects.get(
                user=request.user,
                period=period
            )
            serializer = self.get_serializer(entry)
            return Response(serializer.data)
        except Leaderboard.DoesNotExist:
            return Response(
                {'detail': 'Not ranked yet'},
                status=status.HTTP_404_NOT_FOUND
            )