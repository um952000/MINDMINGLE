from urllib import request

from django.contrib.auth import get_user_model
from rest_framework import serializers

from ..models import Profile, Friendship
from apps.gamification.models import Reputation, UserLevel, Badge, UserBadge

User = get_user_model()


# =========================================================
# 🔹 REGISTRATION SERIALIZER
# =========================================================
class RegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'password',
            'password2'
        )

        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):

        # Username check
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({
                'username': 'Username already exists.'
            })

        # Email check
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({
                'email': 'Email already exists.'
            })

        # Password match check
        if data['password'] != data['password2']:
            raise serializers.ValidationError({
                'password': 'Passwords must match.'
            })

        return data

    def create(self, validated_data):

        validated_data.pop('password2')

        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )

        user.set_password(validated_data['password'])
        user.save()

        return user


# =========================================================
# 🔹 PROFILE SERIALIZER
# =========================================================
class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile

        exclude = ['user']


# =========================================================
# 🔹 USER READ SERIALIZER (GET USER API)
# =========================================================
class UserSerializer(serializers.ModelSerializer):

    profile = ProfileSerializer(read_only=True)

    is_following = serializers.SerializerMethodField()

    # Optional gamification fields
    level = serializers.SerializerMethodField()
    # reputation = serializers.SerializerMethodField()
    badges = serializers.SerializerMethodField()
    
    friendship_status = serializers.SerializerMethodField(default=None)

    class Meta:
        model = User

        fields = [
            'id',

            'username',
            'email',

            'first_name',
            'last_name',

            'avatar',
            'bio',
            'location',
            'skills',

            'is_online',
            'last_seen',

            'followers_count',
            'following_count',

            'is_private',

            'total_doubts_asked',
            'total_answers_given',
            'accepted_answers_count',

            'date_joined',

            # Nested profile
            'profile',

            # Following status
            'is_following',
            'friendship_status',

            # Gamification
            'level',
            'badges',
        ]

        read_only_fields = [
            'id',

            'followers_count',
            'following_count',

            'is_online',
            'last_seen',

            'date_joined',
        ]

    # -----------------------------------------------------
    # 🔹 FOLLOW STATUS
    # -----------------------------------------------------
    def get_is_following(self, obj):

        request = self.context.get('request')

        if request and request.user.is_authenticated:

            return Friendship.objects.filter(
                from_user=request.user,
                to_user=obj,
                status='accepted'
            ).exists()

        return False

    # -----------------------------------------------------
    # 🔹 FRIENDSHIP STATUS
    # -----------------------------------------------------
    
    
    def get_friendship_status(self, obj):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            return None

        friendship = Friendship.objects.filter(
            from_user=request.user,
            to_user=obj
        ).first()

        if friendship:
            return friendship.status

        return None

    # -----------------------------------------------------
    # 🔹 USER LEVEL
    # -----------------------------------------------------
    def get_level(self, obj):

        try:
            return obj.user_level.level
        except:
            return None

    # -----------------------------------------------------
    # 🔹 USER REPUTATION
    # -----------------------------------------------------
    # def get_reputation(self, obj):

    #     try:
    #         reputation = Reputation.objects.get(user=obj)
    #         return reputation.points
    #     except Reputation.DoesNotExist:
    #         return 0

    # -----------------------------------------------------
    # 🔹 USER BADGES
    # -----------------------------------------------------
    def get_badges(self, obj):
        from apps.gamification.models import UserBadge

        badges = UserBadge.objects.filter(user=obj)

        return [
            {
                "id": badge.badge.id,
                "name": badge.badge.name,
                "description": badge.badge.description,
                "icon": badge.badge.icon,   # direct string
                "awarded_at": badge.awarded_at,
            }
            for badge in badges
        ]


# =========================================================
# 🔹 USER + PROFILE UPDATE SERIALIZER
# =========================================================
class UserProfileUpdateSerializer(serializers.ModelSerializer):

    profile = ProfileSerializer(required=False)

    class Meta:
        model = User

        fields = [
            'first_name',
            'last_name',

            'bio',
            'location',

            'skills',

            'avatar',

            'profile'
        ]

    # -----------------------------------------------------
    # 🔹 VALIDATE SKILLS
    # -----------------------------------------------------
    def validate_skills(self, value):

        if not isinstance(value, list):
            raise serializers.ValidationError(
                "Skills must be a list."
            )

        return value

    # -----------------------------------------------------
    # 🔹 UPDATE USER + PROFILE
    # -----------------------------------------------------
    def update(self, instance, validated_data):

        profile_data = validated_data.pop('profile', None)

        # ---------------------------------------------
        # Update User fields
        # ---------------------------------------------
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # ---------------------------------------------
        # Update Profile fields
        # ---------------------------------------------
        if profile_data:

            profile, created = Profile.objects.get_or_create(
                user=instance
            )

            for attr, value in profile_data.items():
                setattr(profile, attr, value)

            profile.save()

        return instance


# =========================================================
# 🔹 FRIENDSHIP SERIALIZER
# =========================================================

class FriendshipSerializer(serializers.ModelSerializer):

    # USERNAMES
    from_user = serializers.CharField(
        source='from_user.username',
        read_only=True
    )

    to_user = serializers.CharField(
        source='to_user.username',
        read_only=True
    )

    # IDS
    from_user_id = serializers.IntegerField(
        source='from_user.id',
        read_only=True
    )

    to_user_id = serializers.IntegerField(
        source='to_user.id',
        read_only=True
    )

    # AVATARS
    from_user_avatar = serializers.SerializerMethodField()
    to_user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Friendship

        fields = [
            'id',

            # usernames
            'from_user',
            'to_user',

            # ids
            'from_user_id',
            'to_user_id',

            # avatars
            'from_user_avatar',
            'to_user_avatar',

            # status
            'status',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'from_user',
            'from_user_id',
            'created_at'
        ]

    def get_from_user_avatar(self, obj):

        if obj.from_user.avatar:
            request = self.context.get('request')

            if request:
                return request.build_absolute_uri(
                    obj.from_user.avatar.url
                )

            return obj.from_user.avatar.url

        return None

    def get_to_user_avatar(self, obj):

        if obj.to_user.avatar:
            request = self.context.get('request')

            if request:
                return request.build_absolute_uri(
                    obj.to_user.avatar.url
                )

            return obj.to_user.avatar.url

        return None


# =========================================================
# 🔹 TOGGLE PRIVACY SERIALIZER
# =========================================================
class TogglePrivacySerializer(serializers.Serializer):

    is_private = serializers.BooleanField(
        required=False,
        help_text="Current privacy status will be toggled automatically"
    )