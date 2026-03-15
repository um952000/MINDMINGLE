from django.contrib import admin
from .models import Doubt, Answer, Comment, Reaction, Tag, DoubtImage

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']
    ordering = ['name']

@admin.register(Doubt)
class DoubtAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'answers_count', 'views_count', 'is_resolved', 'created_at']
    list_filter = ['is_resolved', 'is_trending', 'is_public', 'created_at']
    search_fields = ['title', 'content', 'author__username']
    list_select_related = ['author']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['tags', 'upvotes', 'downvotes']

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['doubt', 'author', 'is_accepted', 'created_at']
    list_filter = ['is_accepted', 'created_at']
    list_select_related = ['doubt', 'author']
    search_fields = ['content', 'doubt__title', 'author__username']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'doubt', 'answer', 'content_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'author__username']
    list_select_related = ['author']
    readonly_fields = ['created_at', 'updated_at']

    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'

@admin.register(Reaction)
class ReactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'doubt', 'answer', 'reaction_type', 'created_at']
    list_filter = ['reaction_type', 'created_at']
    search_fields = ['user__username']
    list_select_related = ['user']
    readonly_fields = ['created_at']

@admin.register(DoubtImage)
class DoubtImageAdmin(admin.ModelAdmin):
    list_display = ['doubt', 'image_preview', 'uploaded_at']
    readonly_fields = ['uploaded_at']
    list_select_related = ['doubt']

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" height="100" />', obj.image.url)
        return "No image"
    image_preview.short_description = 'Image Preview'

