from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'doubts',   views.DoubtViewSet,      basename='doubt')      # ✅
router.register(r'answers',  views.AnswerViewSet,      basename='answer')     # ✅
router.register(r'comments', views.CommentViewSet,     basename='comment')    # ✅
router.register(r'images',   views.DoubtImageViewSet,  basename='doubtimage') # ✅

urlpatterns = [
    path('', include(router.urls)),
]