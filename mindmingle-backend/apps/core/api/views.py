from urllib import request

from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from ..models import User, Profile, Friendship
from .serializers import UserSerializer, ProfileSerializer, FriendshipSerializer, RegistrationSerializer, TogglePrivacySerializer
from rest_framework.views import APIView

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from rest_framework import serializers

from django.db.models import F

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def registration_view(request):

#     serializer = RegistrationSerializer(data=request.data)
    
#     data = {}

#     if serializer.is_valid():
#         account = serializer.save()
#         data['response'] = 'Registration successful'
#         data['username'] = account.username
#         data['email'] = account.email
        
#         # for Token Authentication
#         # token = Token.objects.get(user=account).key
#         # data['token'] = token
        
#         # for JWT Authentication
#         refresh = RefreshToken.for_user(account)
#         data['token'] = {
#             'refresh': str(refresh),
#             'access': str(refresh.access_token),
#         }
        
#         return Response(data, status=status.HTTP_201_CREATED)

#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['POST'])
# def logout_view(request):
    
#     if request.method == 'POST':
#         request.user.auth_token.delete() # To delete the user's auth token from the database, effectively logging them out and preventing further authenticated requests using that token.
#         return Response(status=status.HTTP_200_OK)

class RegistrationView(APIView):
    permission_classes = [AllowAny]
    serializer_class = RegistrationSerializer
    
    @swagger_auto_schema(request_body=RegistrationSerializer)
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)

        if serializer.is_valid():
            account = serializer.save()

            refresh = RefreshToken.for_user(account)

            data = {
                'response': 'Registration successful',
                'username': account.username,
                'email': account.email,
                'token': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }

            return Response(data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['refresh'],
            properties={
                'refresh': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )
    )
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"message": "Logout successful"},
                status=status.HTTP_205_RESET_CONTENT
            )

        except Exception:
            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )

#USER APIs using ViewSets
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    # To optimize database queries and reduce the number of queries made when retrieving user data,
    # we can use the select_related method to fetch related profile 
    # information in a single query. This will improve the performance
    # of our API endpoints that return user data along with their profiles.
    # exclude the authenticated user from the queryset to prevent them from seeing their own profile in the list of users.
    # This is done by filtering out the user with the same ID as the authenticated user.
    # Working : GET all users except self
    # api: GET /api/users/ - to get a list of all users (excluding the authenticated user)
    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id).select_related('profile')
    
    @action(detail=False, methods=['get'])
    def me(self, request, pk=None):
        #Get current authenticated user's profile
        #context is used to pass additional information to the serializer, in this case, the request object. This allows the serializer to access the authenticated user and determine if they are following the user being serialized.
        serializer = self.get_serializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
        
    
    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        user = request.user
        profile = user.profile

        serializer = ProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(request_body=TogglePrivacySerializer)
    @action(detail=False, methods=['post'])
    def toggle_privacy(self, request):
        user = request.user
        user.is_private = not user.is_private
        user.save(update_fields=['is_private'])

        return Response({
            "is_private": user.is_private
        })   


class FriendshipViewSet(viewsets.ModelViewSet):
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Friendship.objects.filter(
            Q(from_user=self.request.user) | Q(to_user=self.request.user)
        ).select_related('from_user', 'to_user')

    def perform_create(self, serializer):
        to_username = self.request.data.get('to_user')
        to_user = get_object_or_404(User, username=to_username)

        if to_user == self.request.user:
            raise serializers.ValidationError({'to_user': 'Cannot follow yourself.'})

        # Prevent duplicate friendship
        if Friendship.objects.filter(from_user=self.request.user, to_user=to_user).exists():
            raise serializers.ValidationError({'to_user': 'Follow request already exists.'})

        # Public user: auto-accept
        if not to_user.is_private:
            friendship = serializer.save(
                from_user=self.request.user,
                to_user=to_user,
                status='accepted'
            )
            # Update counters immediately
            User.objects.filter(id=self.request.user.id).update(following_count=F('following_count') + 1)
            User.objects.filter(id=to_user.id).update(followers_count=F('followers_count') + 1)
        else:
            # Private user: pending request
            serializer.save(from_user=self.request.user, to_user=to_user, status='pending')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        friendship = self.get_object()

        # Only private users can accept
        if not friendship.to_user.is_private:
            return Response(
                {"error": "Cannot accept follow for a public user."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if friendship.to_user != request.user:
            return Response({'error': 'Cannot accept other user requests'}, status=status.HTTP_403_FORBIDDEN)

        friendship.accept()
        serializer = self.get_serializer(friendship)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        friendship = self.get_object()

        # Only private users can reject
        if not friendship.to_user.is_private:
            return Response(
                {"error": "Cannot reject request for a public user."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if friendship.to_user != request.user:
            return Response({'error': 'Cannot reject other user requests'}, status=status.HTTP_403_FORBIDDEN)

        friendship.reject()
        serializer = self.get_serializer(friendship)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        Remove a friendship. Either follower or followed can delete.
        """
        instance = self.get_object()

        # Only allow involved users
        if request.user != instance.from_user and request.user != instance.to_user:
            return Response(
                {"error": "You can only remove friendships involving yourself."},
                status=status.HTTP_403_FORBIDDEN
            )

        if instance.status == 'accepted':
            if request.user == instance.from_user:
                # Follower removes the followed
                User.objects.filter(id=instance.from_user.id).update(
                    following_count=F('following_count') - 1
                )
                User.objects.filter(id=instance.to_user.id).update(
                    followers_count=F('followers_count') - 1
                )
            else:
                # Followed removes a follower
                User.objects.filter(id=instance.to_user.id).update(
                    following_count=F('following_count') - 1
                )
                User.objects.filter(id=instance.from_user.id).update(
                    followers_count=F('followers_count') - 1
                )

        # Delete the friendship row
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)