from django.contrib.auth import get_user_model
from rest_framework import serializers
from ..models import Profile, Friendship, User

User = get_user_model()

class RegistrationSerializer(serializers.ModelSerializer):
    
    password2 = serializers.CharField(style = {'input_type': 'password'},write_only=True) # To confirm the password during registration, we add a second password field that is write-only and will be used to validate that the user has entered the same password twice.
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')
        extra_kwargs = {
            'password': {'write_only': True}    # To ensure that the password field is write-only, meaning it will not be included in the serialized output when retrieving user data. This is a security measure to prevent exposing sensitive information.        
        }
        
    def save(self):
        user = User(
            username=self.validated_data['username'],
            email=self.validated_data['email']
        )
        
        if User.objects.filter(username=user.username).exists():
            raise serializers.ValidationError({'username': 'Username already exists.'})
        
        if User.objects.filter(email=user.email).exists():
            raise serializers.ValidationError({'email': 'Email already exists.'})
        
        password = self.validated_data['password']
        password2 = self.validated_data['password2']
        
        if password != password2:
            raise serializers.ValidationError({'password': 'Passwords must match.'})
        
        account = User(email=self.validated_data['email'], username=self.validated_data['username'])
        
        account.set_password(password) # To hash the password before saving it to the database, we use the set_password method provided by Django's User model. This ensures that the password is stored securely and not in plain text.
        account.save()
        return account    


class UserSerializer(serializers.ModelSerializer):
    
    profile = serializers.SerializerMethodField() # To include the user's profile information in the serialized output, we define a SerializerMethodField that will call a custom method to retrieve and serialize the profile data.
    is_following = serializers.SerializerMethodField() # To indicate whether the authenticated user is following the user being serialized, we add another SerializerMethodField that will check the friendship status between the two users.
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'avatar', 'bio', 'location', 'reputation', 'skills', 
                 'is_online', 'last_seen', 'followers_count', 'following_count',
                 'profile', 'is_following']
        read_only_fields = ['id', 'reputation', 'followers_count', 'following_count', 'is_online', 'last_seen']
    
    def get_profile(self, obj):
        try:
            profile = obj.profile
            return ProfileSerializer(profile).data
        except:
            return None
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Friendship.objects.filter(
                from_user=request.user, to_user=obj, status='accepted'
            ).exists()
        return False     
    
    
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'
   
        
class FriendshipSerializer(serializers.ModelSerializer):
    from_user = serializers.ReadOnlyField(source='from_user.username')
    to_user = serializers.ReadOnlyField(source='to_user.username')
    
    class Meta:
        model = Friendship
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at']
        read_only_fields = ['id']    
        

class TogglePrivacySerializer(serializers.Serializer):
    is_private = serializers.BooleanField(required=False, help_text="Current privacy status will be toggled automatically")                   