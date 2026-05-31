from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, pagination
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from ..models import Doubt, Answer, Comment, Reaction, DoubtImage
from .serializers import (
    DoubtSerializer, AnswerSerializer, CommentSerializer,
    ReactionSerializer, DoubtImageSerializer
)
from django.db.models import F
from .permissions import IsOwnerOrReadOnly

from rest_framework.filters import SearchFilter


User = get_user_model()


class StandardPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class DoubtViewSet(viewsets.ModelViewSet):
    queryset = Doubt.objects.all()
    serializer_class = DoubtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [SearchFilter]
    search_fields = ['title', 'content']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Doubt.objects.none()

        queryset = Doubt.objects.select_related('author').prefetch_related(
            'tags', 'images', 'author__user_level', 'author__profile'
        )

        author = self.request.query_params.get('author')
        if author:
            return queryset.filter(author__id=author).order_by('-created_at')

        sort = self.request.query_params.get('sort', 'recent')

        if sort == 'trending':
            return queryset.filter(is_public=True).order_by(
                '-is_trending', '-answers_count', '-created_at'
            )
        elif sort == 'unanswered':
            return queryset.filter(
                is_public=True, answers_count=0
            ).order_by('-created_at')
        elif sort == 'following':
            following_users = self.request.user.friendship_requests_sent.filter(
                status='accepted'
            ).values_list('to_user', flat=True)
            return queryset.filter(author__in=following_users).order_by('-created_at')

        return queryset.filter(is_public=True).order_by('-created_at')

    def get_serializer_context(self):
        return {'request': self.request}  # ✅ needed for user_upvoted/user_downvoted

    # def perform_create(self, serializer):
    #     serializer.save(author=self.request.user)
    
    def perform_create(self, serializer):
        doubt = serializer.save(author=self.request.user)
        
        self.request.user.total_doubts_asked = F('total_doubts_asked') + 1
        self.request.user.save(update_fields=['total_doubts_asked'])

    # 🔥 EVENT
        from apps.gamification.api.events import EventDispatcher
        from apps.gamification.api.event_types import DOUBT_CREATED

        EventDispatcher.dispatch(
            DOUBT_CREATED,
            user=self.request.user
        )


    @action(
        detail=True, methods=['post'],
        permission_classes=[IsAuthenticated],
        parser_classes=[MultiPartParser, FormParser],
        serializer_class=DoubtImageSerializer
    )
    def upload_image(self, request, pk=None):
        doubt = self.get_object()
        images = request.FILES.getlist('image')

        if not images:
            return Response(
                {'error': 'No images provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        created = []
        for image in images:
            obj = DoubtImage.objects.create(doubt=doubt, image=image)
            created.append(DoubtImageSerializer(obj).data)

        return Response(created, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def answers(self, request, pk=None):
        doubt = self.get_object()
        serializer = AnswerSerializer(
            doubt.answers.select_related('author').all(),
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upvote(self, request, pk=None):
        doubt = self.get_object()
        user = request.user

        doubt.downvotes.remove(user)

        if doubt.upvotes.filter(id=user.id).exists():
            doubt.upvotes.remove(user)
            message = 'Upvote removed'
        else:
            doubt.upvotes.add(user)
            message = 'Upvoted successfully'

        doubt.upvotes_count = doubt.upvotes.count()
        doubt.downvotes_count = doubt.downvotes.count()
        doubt.save(update_fields=['upvotes_count', 'downvotes_count'])

        return Response({
            'message': message,
            'upvotes': doubt.upvotes_count,
            'downvotes': doubt.downvotes_count,
            'user_upvoted': doubt.upvotes.filter(id=user.id).exists(),    
            'user_downvoted': doubt.downvotes.filter(id=user.id).exists(), 
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def downvote(self, request, pk=None):
        doubt = self.get_object()
        user = request.user

        doubt.upvotes.remove(user)

        if doubt.downvotes.filter(id=user.id).exists():
            doubt.downvotes.remove(user)
            message = 'Downvote removed'
        else:
            doubt.downvotes.add(user)
            message = 'Downvoted successfully'

        doubt.upvotes_count = doubt.upvotes.count()
        doubt.downvotes_count = doubt.downvotes.count()
        doubt.save(update_fields=['upvotes_count', 'downvotes_count'])

        return Response({
            'message': message,
            'upvotes': doubt.upvotes_count,
            'downvotes': doubt.downvotes_count,
            'user_upvoted': doubt.upvotes.filter(id=user.id).exists(),    # ✅
            'user_downvoted': doubt.downvotes.filter(id=user.id).exists(), # ✅
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
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


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Doubt.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    # def get_queryset(self):
    #     if getattr(self, 'swagger_fake_view', False):
    #         return Answer.objects.none()

    #     queryset = Answer.objects.select_related('author', 'doubt')
    #     doubt_id = self.request.query_params.get('doubt_id')
    #     if doubt_id:
    #         queryset = queryset.filter(doubt_id=doubt_id)
    #     return queryset
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Answer.objects.none()

        queryset = Answer.objects.select_related(
            'author',
            'author__profile',
            'author__user_level',
            'doubt'
        )

        doubt_id = self.request.query_params.get('doubt_id')
        if doubt_id:
            queryset = queryset.filter(doubt_id=doubt_id)

        author_id = self.request.query_params.get('author')
        if author_id:
            queryset = queryset.filter(author_id=author_id)

        return queryset.order_by('-created_at')

    def get_serializer_context(self):
        return {'request': self.request}  # ✅ needed for user_upvoted/user_downvoted

    # def perform_create(self, serializer):
    #     serializer.save(author=self.request.user)
    
    def perform_create(self, serializer):
        answer = serializer.save(author=self.request.user)
        
        self.request.user.total_answers_given = F('total_answers_given') + 1
        self.request.user.save(update_fields=['total_answers_given'])

        # 🔥 EVENT
        from apps.gamification.api.events import EventDispatcher
        from apps.gamification.api.event_types import ANSWER_CREATED

        EventDispatcher.dispatch(
            ANSWER_CREATED,
            user=self.request.user
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upvote(self, request, pk=None):
        answer = self.get_object()
        user = request.user

        answer.downvotes.remove(user)

        if answer.upvotes.filter(id=user.id).exists():
            answer.upvotes.remove(user)
            message = 'Upvote removed'
        else:
            answer.upvotes.add(user)
            message = 'Upvoted successfully'

        answer.upvotes_count = answer.upvotes.count()
        answer.downvotes_count = answer.downvotes.count()
        answer.save(update_fields=['upvotes_count', 'downvotes_count'])

        return Response({
            'message': message,
            'upvotes': answer.upvotes_count,
            'downvotes': answer.downvotes_count,
            'user_upvoted': answer.upvotes.filter(id=user.id).exists(),    # ✅
            'user_downvoted': answer.downvotes.filter(id=user.id).exists(), # ✅
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def downvote(self, request, pk=None):
        answer = self.get_object()
        user = request.user

        answer.upvotes.remove(user)

        if answer.downvotes.filter(id=user.id).exists():
            answer.downvotes.remove(user)
            message = 'Downvote removed'
        else:
            answer.downvotes.add(user)
            message = 'Downvoted successfully'

        answer.upvotes_count = answer.upvotes.count()
        answer.downvotes_count = answer.downvotes.count()
        answer.save(update_fields=['upvotes_count', 'downvotes_count'])

        return Response({
            'message': message,
            'upvotes': answer.upvotes_count,
            'downvotes': answer.downvotes_count,
            'user_upvoted': answer.upvotes.filter(id=user.id).exists(),    # ✅
            'user_downvoted': answer.downvotes.filter(id=user.id).exists(), # ✅
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def accept(self, request, pk=None):
        answer = self.get_object()
        doubt = answer.doubt

        if doubt.author != request.user:
            return Response(
                {'error': 'Only the doubt author can accept an answer'},
                status=status.HTTP_403_FORBIDDEN
            )

        # ✅ FIX: trigger signals properly
        for ans in doubt.answers.filter(is_accepted=True):
            if ans.id != answer.id:
                ans.is_accepted = False
                ans.save()

        # ✅ Accept new answer
        answer.is_accepted = True
        answer.save()
        
        answer.author.accepted_answers_count = (
        F('accepted_answers_count') + 1)

        answer.author.save(update_fields=['accepted_answers_count'])

        doubt.is_resolved = True
        doubt.save(update_fields=['is_resolved'])

        return Response({'message': 'Answer accepted', 'is_accepted': True})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def react(self, request, pk=None):
        answer = self.get_object()
        reaction_type = request.data.get('reaction_type')
        reaction, created = Reaction.objects.get_or_create(
            user=request.user, answer=answer,
            defaults={'reaction_type': reaction_type}
        )
        if not created:
            reaction.reaction_type = reaction_type
            reaction.save()
        return Response({'reaction_type': reaction_type})


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Doubt.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Comment.objects.none()

        queryset = Comment.objects.select_related('author', 'doubt', 'answer')
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
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(
            doubt=get_object_or_404(Doubt, pk=self.request.data['doubt'])
        )