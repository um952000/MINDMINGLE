from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import Doubt, Comment, Answer, Reaction, Tag, DoubtImage
from apps.core.api.serializers import UserSerializer

from django.db.models import Count

User = get_user_model()

class DoubtImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoubtImage
        fields = ['id', 'image', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']      
        
                
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']   


class DoubtSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    # For displaying tags associated with the doubt(used in GET request)
    tags = TagSerializer(many=True, read_only=True)
    
    # For accepting tag names during doubt creation or update(used in POST/PUT request)
    tag_names = serializers.ListField(
        child = serializers.CharField(max_length=50),
        write_only=True,
        required=False
    )
    
    # For accepting multiple images during doubt creation or update(used in POST/PUT request)
    # images_upload = serializers.ListField(
    #     child=serializers.ImageField(),
    #     write_only=True,
    #     required=False
    # )
    
    # images_upload = serializers.ListField(
    #     child=serializers.FileField(),
    #     write_only=True,
    #     required=False
    # )
    
    upvotes_count = serializers.SerializerMethodField()
    downvotes_count = serializers.SerializerMethodField()
    reactions_summary = serializers.SerializerMethodField()
    images = DoubtImageSerializer(many=True, read_only=True)

    class Meta:
        model = Doubt
        fields = [
            'id', 'title', 'content', 'tags', 'tag_names', 'author', 
            'ai_summary', 'upvotes_count', 'downvotes_count', 'answers_count',
            'views_count', 'is_trending', 'is_public', 'is_resolved',
            'created_at', 'updated_at', 'images', 'reactions_summary'
        ]
        read_only_fields = ['id', 'author', 'tags', 'upvotes_count', 
                          'downvotes_count', 'answers_count', 'images', 'reactions_summary']
    
    def get_upvotes_count(self, obj):
        return obj.upvotes.count()   # Assuming you have a related name 'upvotes' for the upvote relationship
        # obj.upvotes gives you the list of users who upvoted the doubt, so you can count them to get the total number of upvotes.
        
    def get_downvotes_count(self, obj):
        return obj.downvotes.count() # Assuming you have a related name 'downvotes' for the downvote relationship
        # obj.downvotes gives you the list of users who downvoted the doubt, so you can count them to get the total number of downvotes.
    
    def get_reactions_summary(self, obj):
        reactions = obj.reaction_set.values('reaction_type').annotate(count=Count('id'))
        return {r['reaction_type']: r['count'] for r in reactions}
    
    def create(self, validated_data):
        # Pop the tag names from the validated data and create the doubt first, then associate the tags with the doubt Because tag_names is NOT a field in the Doubt model.
        tag_names = validated_data.pop('tag_names', [])
        
        doubt = Doubt.objects.create(**validated_data)
        
        for tag_name in tag_names:
            tag, created = Tag.objects.get_or_create(name=tag_name)
            doubt.tags.add(tag)
            
        return doubt
    
    
class AnswerSerializer(serializers.ModelSerializer):
    
    #backend automatically sets the author to the user making the request, so we make it read-only in the serializer 
    # and set it in the create method.Indirectly we are attaching the user for the Answer.
    author = UserSerializer(read_only=True)
    
    upvotes_count = serializers.SerializerMethodField()
    downvotes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Answer
        fields = [
            'id', 'doubt', 'author', 'content', 'ai_summary', 'is_accepted',
            'parent', 'upvotes_count', 'downvotes_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'upvotes_count', 'downvotes_count']
    
    def get_upvotes_count(self, obj):
        return obj.upvotes.count()   # Assuming you have a related name 'upvotes' for the upvote relationship in Answer model
    
    def get_downvotes_count(self, obj):
        return obj.downvotes.count() # Assuming you have a related name 'downvotes' for the downvote relationship in Answer model
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
    
class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = [
            'id', 'doubt', 'answer', 'author', 'content', 'parent', 
            'likes_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class ReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reaction
        fields = ['id', 'reaction_type']
        read_only_fields = ['id']        
        
  