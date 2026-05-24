from rest_framework import serializers
from ..models import Badge, UserBadge, Reputation, UserLevel, Leaderboard


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'slug', 'description', 'icon', 'points_required']


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)

    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'username', 'avatar', 'awarded_at']


class ReputationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reputation
        fields = ['id', 'points', 'reason', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserLevelSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    badges = UserBadgeSerializer(source='user.user_badges', many=True, read_only=True)
    reputation_logs = ReputationSerializer(source='user.reputation_logs', many=True, read_only=True)

    class Meta:
        model = UserLevel
        fields = [
            'id', 'username', 'avatar',
            'level', 'total_reputation',
            'streak_days', 'last_active_date',
            'badges', 'reputation_logs',
        ]
        read_only_fields = ['id', 'level', 'total_reputation', 'streak_days']


class LeaderboardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    level = serializers.CharField(source='user.user_level.level', read_only=True)

    class Meta:
        model = Leaderboard
        fields = ['id', 'period', 'username', 'avatar', 'level', 'score', 'rank', 'updated_at']
        read_only_fields = ['id', 'rank', 'updated_at']