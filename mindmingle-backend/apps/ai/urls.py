from django.urls import path
from .views import SolveDoubtAPIView

urlpatterns = [
    path(
        'solve-doubt/',
        SolveDoubtAPIView.as_view(),
        name='solve-doubt'
    ),
]