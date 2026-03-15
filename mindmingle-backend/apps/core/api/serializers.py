# from django.contrib.auth import get_user_model
# from rest_framework import serializers
# from ..models import Profile, Friendship, User
# from apps.gamification.models import Reputation, UserLevel, Badge, UserBadge

# User = get_user_model()

# class BadgeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Badge
#         fields = ['id', 'name', 'slug', 'description', 'icon']

# class UserBadgeSerializer(serializers.ModelSerializer):
#     badge = BadgeSerializer(read_only=True)
#     class Meta:
#         model = UserBadge
#         fields = ['badge', 'awarded_at']

# class UserLevelSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserLevel
#         fields = ['level', 'total_reputation', 'streak_days', 'last_active_date']

# class RegistrationSerializer(serializers.ModelSerializer):
    
#     password2 = serializers.CharField(style = {'input_type': 'password'},write_only=True) # To confirm the password during registration, we add a second password field that is write-only and will be used to validate that the user has entered the same password twice.
#     class Meta:
#         model = User
#         fields = ('username', 'email', 'password', 'password2')
#         extra_kwargs = {
#             'password': {'write_only': True}    # To ensure that the password field is write-only, meaning it will not be included in the serialized output when retrieving user data. This is a security measure to prevent exposing sensitive information.        
#         }
        
#     def save(self):
#         user = User(
#             username=self.validated_data['username'],
#             email=self.validated_data['email']
#         )
        
#         if User.objects.filter(username=user.username).exists():
#             raise serializers.ValidationError({'username': 'Username already exists.'})
        
#         if User.objects.filter(email=user.email).exists():
#             raise serializers.ValidationError({'email': 'Email already exists.'})
        
#         password = self.validated_data['password']
#         password2 = self.validated_data['password2']
        
#         if password != password2:
#             raise serializers.ValidationError({'password': 'Passwords must match.'})
        
#         account = User(email=self.validated_data['email'], username=self.validated_data['username'])
        
#         account.set_password(password) # To hash the password before saving it to the database, we use the set_password method provided by Django's User model. This ensures that the password is stored securely and not in plain text.
#         account.save()
#         return account    
    
# class ProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Profile
#         fields = '__all__'

# class UserSerializer(serializers.ModelSerializer):
    
#     profile = serializers.SerializerMethodField() # To include the user's profile information in the serialized output, we define a SerializerMethodField that will call a custom method to retrieve and serialize the profile data.
#     is_following = serializers.SerializerMethodField() # To indicate whether the authenticated user is following the user being serialized, we add another SerializerMethodField that will check the friendship status between the two users.
#     user_level = serializers.SerializerMethodField() # To include the user's level information in the serialized output, we add another SerializerMethodField that will call a custom method to retrieve and serialize the user's level data.
#     user_badges = serializers.SerializerMethodField() # To include the user's badges in the serialized output, we add another SerializerMethodField that will call a custom method to retrieve and serialize the user's badges data.
    
    
#     class Meta:
#         model = User
#         fields = ['id', 'username', 'email', 'first_name', 'last_name', 
#                  'avatar', 'bio', 'location',
#                  'skills', 
#                  'is_online', 'last_seen', 'followers_count', 'following_count',
#                  'profile', 'is_following',
#                     'user_level', 'user_badges',
#                  ]
#         read_only_fields = ['id','followers_count', 'following_count', 'is_online', 'last_seen']
    
#     def get_profile(self, obj):
#         try:
#             profile = obj.profile
#             return ProfileSerializer(profile).data
#         except:
#             return None
    
#     def get_is_following(self, obj):
#         request = self.context.get('request')
#         if request and request.user.is_authenticated:
#             return Friendship.objects.filter(
#                 from_user=request.user, to_user=obj, status='accepted'
#             ).exists()
#         return False     
    

   
        
# class FriendshipSerializer(serializers.ModelSerializer):
#     from_user = serializers.ReadOnlyField(source='from_user.username')
#     to_user = serializers.ReadOnlyField(source='to_user.username')
    
#     class Meta:
#         model = Friendship
#         fields = ['id', 'from_user', 'to_user', 'status', 'created_at']
#         read_only_fields = ['id']    
        

# class TogglePrivacySerializer(serializers.Serializer):
#     is_private = serializers.BooleanField(required=False, help_text="Current privacy status will be toggled automatically")                   


from django.contrib.auth import get_user_model
from rest_framework import serializers
from ..models import Profile, Friendship, User
from apps.gamification.models import Reputation, UserLevel, Badge, UserBadge

User = get_user_model()


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'slug', 'description', 'icon']


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    class Meta:
        model = UserBadge
        fields = ['badge', 'awarded_at']


class UserLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLevel
        fields = ['level', 'total_reputation', 'streak_days', 'last_active_date']


class RegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def save(self):
        if User.objects.filter(username=self.validated_data['username']).exists():
            raise serializers.ValidationError({'username': 'Username already exists.'})

        if User.objects.filter(email=self.validated_data['email']).exists():
            raise serializers.ValidationError({'email': 'Email already exists.'})

        password = self.validated_data['password']
        password2 = self.validated_data['password2']

        if password != password2:
            raise serializers.ValidationError({'password': 'Passwords must match.'})

        account = User(
            email=self.validated_data['email'],
            username=self.validated_data['username']
        )
        account.set_password(password)
        account.save()
        return account


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    user_level = serializers.SerializerMethodField()    # ✅ needs get_user_level method
    user_badges = serializers.SerializerMethodField()  # ✅ needs get_user_badges method

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'avatar', 'bio', 'location', 'skills',
            'is_online', 'last_seen', 'followers_count', 'following_count',
            'total_doubts_asked', 'total_answers_given', 'accepted_answers_count',
            'date_joined',
            'profile', 'is_following', 'user_level', 'user_badges',
        ]
        read_only_fields = ['id', 'followers_count', 'following_count', 'is_online', 'last_seen']

    def get_profile(self, obj):
        try:
            return ProfileSerializer(obj.profile).data
        except:
            return None

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Friendship.objects.filter(
                from_user=request.user, to_user=obj, status='accepted'
            ).exists()
        return False

    def get_user_level(self, obj):
        """✅ this method was missing — caused the 500 error"""
        try:
            user_level = obj.user_level  # related_name='user_level' on UserLevel model
            return UserLevelSerializer(user_level).data
        except UserLevel.DoesNotExist:
            return {
                'level': 'Beginner',
                'total_reputation': 0,
                'streak_days': 0,
                'last_active_date': None,
            }

    def get_user_badges(self, obj):
        """✅ this method was also missing"""
        try:
            badges = obj.user_badges.select_related('badge').all()
            return UserBadgeSerializer(badges, many=True).data
        except:
            return []


class FriendshipSerializer(serializers.ModelSerializer):
    from_user = serializers.ReadOnlyField(source='from_user.username')
    to_user = serializers.ReadOnlyField(source='to_user.username')

    class Meta:
        model = Friendship
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at']
        read_only_fields = ['id']


class TogglePrivacySerializer(serializers.Serializer):
    is_private = serializers.BooleanField(
        required=False,
        help_text="Current privacy status will be toggled automatically"
    )