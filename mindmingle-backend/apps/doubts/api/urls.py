from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'doubts', views.DoubtViewSet)
router.register(r'answers', views.AnswerViewSet)
router.register(r'comments', views.CommentViewSet)
router.register(r'images', views.DoubtImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
