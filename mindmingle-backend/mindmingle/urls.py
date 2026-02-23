"""
URL configuration for mindmingle project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from apps.core.api.urls import urlpatterns as core_urls
from rest_framework.permissions import AllowAny

#from apps.doubts.urls import urlpatterns as doubts_urls  # Create later

# schema_view = get_schema_view(
#     openapi.Info(title="MindMingle API", version="1.0.0"),
#     public=True,
# )

schema_view = get_schema_view(
    openapi.Info(
        title="MindMingle API",
        default_version='v1',
        description="API documentation for MindMingle",
    ),
    public=True,
    permission_classes=[AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('account/', include('apps.core.api.urls')),
    path('api/core/', include(core_urls)),
    
    # Swagger URLs
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='redoc'),
    
]
