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
from .serializers import UserSerializer, ProfileSerializer, FriendshipSerializer, RegistrationSerializer, TogglePrivacySerializer, UserProfileUpdateSerializer
from rest_framework.views import APIView

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from rest_framework import serializers

from django.db.models import F
from rest_framework.filters import SearchFilter
    

class AuthViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.none()

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
        })

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
    filter_backends = [SearchFilter]          # add this
    search_fields = ['username', 'first_name', 'last_name']   # add this
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return User.objects.none()

        # ✅ for detail view (retrieve), include all users
        # for list view, exclude self
        if self.action == 'retrieve':
            return User.objects.all().select_related(
                'profile', 'user_level'
            ).prefetch_related('user_badges__badge')

        # list - exclude self
        return User.objects.exclude(
            id=self.request.user.id
        ).select_related(
            'profile', 'user_level'
        ).prefetch_related('user_badges__badge')
    
    @action(detail=False, methods=['get'])
    def me(self, request, pk=None):
        serializer = self.get_serializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )

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


# =========================================================
# VIEWSET
# =========================================================

class FriendshipViewSet(viewsets.ModelViewSet):

    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]

    # =====================================================
    # QUERYSET
    # =====================================================

    def get_queryset(self):
            if getattr(self, 'swagger_fake_view', False):
                return Friendship.objects.none()

        # for accept/reject/destroy — user needs to see records they're involved in
            if self.action in ['accept', 'reject', 'destroy', 'retrieve']:
                return Friendship.objects.filter(
                    Q(from_user=self.request.user) |
                    Q(to_user=self.request.user)
                ).select_related('from_user', 'to_user')

            # for list — only show what I sent (instagram style)
            return Friendship.objects.filter(
                from_user=self.request.user
            ).select_related('from_user', 'to_user')

    # =====================================================
    # CREATE FOLLOW REQUEST
    # =====================================================

    def perform_create(self, serializer):

        to_user_id = self.request.data.get('to_user')

        if not to_user_id:
            raise serializers.ValidationError({
                'to_user': 'This field is required.'
            })

        to_user = get_object_or_404(
            User,
            id=to_user_id
        )

        # Cannot follow yourself
        if to_user == self.request.user:
            raise serializers.ValidationError({
                'to_user': 'Cannot follow yourself.'
            })

        # PUBLIC ACCOUNT
        if not to_user.is_private:

            serializer.save(
                from_user=self.request.user,
                to_user=to_user,
                status='accepted'
            )

            # Update counters
            User.objects.filter(
                id=self.request.user.id
            ).update(
                following_count=F('following_count') + 1
            )

            User.objects.filter(
                id=to_user.id
            ).update(
                followers_count=F('followers_count') + 1
            )

        # PRIVATE ACCOUNT
        else:

            serializer.save(
                from_user=self.request.user,
                to_user=to_user,
                status='pending'
            )

    # =====================================================
    # ACCEPT REQUEST
    # =====================================================

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):

        friendship = self.get_object()

        if not friendship.to_user.is_private:
            return Response(
                {
                    "error": "Cannot accept follow for a public user."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if friendship.to_user != request.user:
            return Response(
                {
                    'error': 'Cannot accept other user requests'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        friendship.accept()

        serializer = self.get_serializer(friendship)

        return Response(serializer.data)

    # =====================================================
    # REJECT REQUEST
    # =====================================================

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):

        friendship = self.get_object()

        if not friendship.to_user.is_private:
            return Response(
                {
                    "error": "Cannot reject request for a public user."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if friendship.to_user != request.user:
            return Response(
                {
                    'error': 'Cannot reject other user requests'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        friendship.reject()

        serializer = self.get_serializer(friendship)

        return Response(serializer.data)

    # =====================================================
    # SENT REQUESTS
    # =====================================================

    @action(detail=False, methods=['get'])
    def sent_requests(self, request):

        queryset = Friendship.objects.filter(
            from_user=request.user,
            status='pending'
        ).select_related('to_user')

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return Response(serializer.data)

    # =====================================================
    # RECEIVED REQUESTS
    # =====================================================

    @action(detail=False, methods=['get'])
    def received_requests(self, request):

        queryset = Friendship.objects.filter(
            to_user=request.user,
            status='pending'
        ).select_related('from_user')

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return Response(serializer.data)

    # =====================================================
    # FOLLOWERS
    # =====================================================

    @action(detail=False, methods=['get'])
    def followers(self, request):

        queryset = Friendship.objects.filter(
            to_user=request.user,
            status='accepted'
        ).select_related('from_user')

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return Response(serializer.data)

    # =====================================================
    # FOLLOWING
    # =====================================================

    @action(detail=False, methods=['get'])
    def following(self, request):

        queryset = Friendship.objects.filter(
            from_user=request.user,
            status='accepted'
        ).select_related('to_user')

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return Response(serializer.data)

    # =====================================================
    # CHECK RELATIONSHIP STATUS
    # =====================================================

    @action(detail=False, methods=['get'])
    def relation(self, request):

        user_id = request.query_params.get('user_id')

        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        target_user = get_object_or_404(
            User,
            id=user_id
        )

        friendship = Friendship.objects.filter(
            from_user=request.user,
            to_user=target_user
        ).first()

        if friendship:

            serializer = self.get_serializer(friendship)

            return Response({
                'exists': True,
                'friendship': serializer.data
            })

        return Response({
            'exists': False,
            'friendship': None
        })

    # =====================================================
    # REMOVE FRIENDSHIP / UNFOLLOW
    # =====================================================

    def destroy(self, request, *args, **kwargs):

        instance = self.get_object()

        # Security check
        if (
            request.user != instance.from_user
        ):
            return Response(
                {
                    "error": "You can only remove friendships involving yourself."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Update counts
        if instance.status == 'accepted':

            User.objects.filter(
                id=instance.from_user.id
            ).update(
                following_count=F('following_count') - 1
            )

            User.objects.filter(
                id=instance.to_user.id
            ).update(
                followers_count=F('followers_count') - 1
            )

        instance.delete()

        return Response(
            {
                "message": "Unfollowed successfully"
            },
            status=status.HTTP_204_NO_CONTENT
        )