from django.db import router
from rest_framework.authtoken.views import obtain_auth_token # To create auth tokens for users inside the database it is a table that will be created inside the database to store the auth tokens for users

from django.urls import path, include
from . import views
from .views import LogoutView, RegistrationView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'friendships', views.FriendshipViewSet, basename='friendship')

urlpatterns = [
    
    path('', include(router.urls)),
    
    #for Token Authentication
    #path('login/', obtain_auth_token, name='login'),
    #path('register/', registration_view, name='register'),
    path('register/', RegistrationView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    
    #JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]