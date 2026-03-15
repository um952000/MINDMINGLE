from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from ..models import Doubt, Answer, Comment, Reaction, DoubtImage
from .serializers import (
    DoubtSerializer, AnswerSerializer, CommentSerializer, ReactionSerializer, DoubtImageSerializer
)
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated

from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.db.models import Count

from .permissions import IsOwnerOrReadOnly
from rest_framework import pagination

User = get_user_model()

class DoubtViewSet(viewsets.ModelViewSet):
    queryset = Doubt.objects.select_related('author').prefetch_related('tags', 'images')
    serializer_class = DoubtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    pagination_class = pagination.LimitOffsetPagination
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        parser_classes=[MultiPartParser, FormParser],
        serializer_class=DoubtImageSerializer
    )
    def upload_image(self, request, pk=None):
        doubt = self.get_object()

        images = request.FILES.getlist('image')  # important

        if not images:
            return Response(
                {"error": "No images provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        created_images = []

        for image in images:
            doubt_image = DoubtImage.objects.create(
                doubt=doubt,
                image=image
            )
            created_images.append(DoubtImageSerializer(doubt_image).data)

        return Response(created_images, status=status.HTTP_201_CREATED)

        
        def get_queryset(self):
            queryset = super().get_queryset()
            
            sort = self.request.query_params.get('sort', 'recent')
            if sort == 'trending':
                return queryset.filter(is_public=True).order_by('-is_trending', '-answers_count', '-created_at')
            elif sort == 'following':
                return queryset.filter(author__in=self.request.user.friendship_requests_sent.filter(status='accepted')).order_by('-created_at')
            return queryset.filter(is_public=True).order_by('-created_at')
    
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        
    @action(detail=True, methods=['get'])
    def answers(self, request, pk=None):
        doubt = self.get_object()
        answers = doubt.answers.all()   # related_name='answers'
        serializer = AnswerSerializer(answers, many=True)
        return Response(serializer.data)    
    
    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        doubt = self.get_object()
        if request.user in doubt.upvotes.all():
            doubt.upvotes.remove(request.user)
            return Response({'upvoted': False})
        doubt.upvotes.add(request.user)
        doubt.downvotes.remove(request.user)  # Remove downvote if exists
        return Response({'upvoted': True})
    
    @action(detail=True, methods=['post'])
    def downvote(self, request, pk=None):
        doubt = self.get_object()
        if request.user in doubt.downvotes.all():
            doubt.downvotes.remove(request.user)
            return Response({'downvoted': False})
        doubt.downvotes.add(request.user)
        doubt.upvotes.remove(request.user)  # Remove upvote if exists
        return Response({'downvoted': True})
    
    @action(detail=True, methods=['post'])
    def react(self, request, pk=None):
        doubt = self.get_object()
        reaction_type = request.data.get('reaction_type')
        reaction, created = Reaction.objects.get_or_create(
            user=request.user, doubt=doubt,
            defaults={'reaction_type': reaction_type}
        )
        if not created:
            reaction.reaction_type = reaction_type
            reaction.save()
        return Response({'reaction_type': reaction_type})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upvote(self, request, pk=None):

        doubt = self.get_object()
        user = request.user

        # Remove downvote if exists
        if doubt.downvotes.filter(id=user.id).exists():
            doubt.downvotes.remove(user)

        # Toggle upvote
        if doubt.upvotes.filter(id=user.id).exists():
            doubt.upvotes.remove(user)
            message = "Upvote removed"
        else:
            doubt.upvotes.add(user)
            message = "Upvoted successfully"

        # Update counts
        doubt.upvotes_count = doubt.upvotes.count()
        doubt.downvotes_count = doubt.downvotes.count()
        doubt.save()

        return Response({
            "message": message,
            "upvotes": doubt.upvotes_count,
            "downvotes": doubt.downvotes_count
        })
        
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def downvote(self, request, pk=None):

        doubt = self.get_object()
        user = request.user

        # Remove upvote if exists
        if doubt.upvotes.filter(id=user.id).exists():
            doubt.upvotes.remove(user)

        # Toggle downvote
        if doubt.downvotes.filter(id=user.id).exists():
            doubt.downvotes.remove(user)
            message = "Downvote removed"
        else:
            doubt.downvotes.add(user)
            message = "Downvoted successfully"

        doubt.upvotes_count = doubt.upvotes.count()
        doubt.downvotes_count = doubt.downvotes.count()
        doubt.save()

        return Response({
            "message": message,
            "upvotes": doubt.upvotes_count,
            "downvotes": doubt.downvotes_count
        })
        
            
        
class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.select_related('author', 'doubt')
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        #given by the frontend when fetching answers for a specific doubt, we can filter answers based on the doubt_id query parameter. This allows us to retrieve only the answers related to a particular doubt, improving efficiency and relevance of the data returned to the frontend.
        doubt_id = self.request.query_params.get('doubt_id')
        if doubt_id:
            queryset = queryset.filter(doubt_id=doubt_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        
    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        answer = self.get_object()
        if request.user in answer.upvotes.all():
            answer.upvotes.remove(request.user)
            return Response({'upvoted': False})
        
        answer.upvotes.add(request.user)
        answer.downvotes.remove(request.user)  # Remove downvote if exists  
        return Response({'upvoted': True})
    
    @action(detail=True, methods=['post'])
    def downvote(self, request, pk=None):
        answer = self.get_object()
        if request.user in answer.downvotes.all():
            answer.downvotes.remove(request.user)
            return Response({'downvoted': False})
        
        answer.downvotes.add(request.user)
        answer.upvotes.remove(request.user)  # Remove upvote if exists  
        return Response({'downvoted': True})
    
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upvote(self, request, pk=None):

        answer = self.get_object()
        user = request.user

        # Remove downvote if exists
        if answer.downvotes.filter(id=user.id).exists():
            answer.downvotes.remove(user)

        # Toggle upvote
        if answer.upvotes.filter(id=user.id).exists():
            answer.upvotes.remove(user)
            message = "Upvote removed"
        else:
            answer.upvotes.add(user)
            message = "Upvoted successfully"

        answer.upvotes_count = answer.upvotes.count()
        answer.downvotes_count = answer.downvotes.count()
        answer.save()

        return Response({
            "message": message,
            "upvotes": answer.upvotes_count,
            "downvotes": answer.downvotes_count
        })
        
            
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def downvote(self, request, pk=None):

        answer = self.get_object()
        user = request.user

        # Remove upvote if exists
        if answer.upvotes.filter(id=user.id).exists():
            answer.upvotes.remove(user)

        # Toggle downvote
        if answer.downvotes.filter(id=user.id).exists():
            answer.downvotes.remove(user)
            message = "Downvote removed"
        else:
            answer.downvotes.add(user)
            message = "Downvoted successfully"

        answer.upvotes_count = answer.upvotes.count()
        answer.downvotes_count = answer.downvotes.count()
        answer.save()

        return Response({
            "message": message,
            "upvotes": answer.upvotes_count,
            "downvotes": answer.downvotes_count
        })    

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related('author', 'doubt', 'answer')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()

        doubt_id = self.request.query_params.get('doubt_id')
        answer_id = self.request.query_params.get('answer_id')

        if doubt_id:
            queryset = queryset.filter(doubt_id=doubt_id)

        if answer_id:
            queryset = queryset.filter(answer_id=answer_id)

        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)        
        

class DoubtImageViewSet(viewsets.ModelViewSet):
    queryset = DoubtImage.objects.all()
    serializer_class = DoubtImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(doubt=get_object_or_404(Doubt, pk=self.request.data['doubt']))        