from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile, Friendship

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'is_admin', 'is_online']
    list_filter = ['is_admin', 'is_online']
    search_fields = ['username', 'email']

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'created_at']
    list_filter = ['created_at']

@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ['from_user', 'to_user', 'status', 'created_at']
    list_filter = ['status']
    list_select_related = ['from_user', 'to_user']
