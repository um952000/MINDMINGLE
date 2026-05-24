from rest_framework.permissions import SAFE_METHODS, BasePermission

class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        
        # Allow GET, HEAD, OPTIONS
        if request.method in SAFE_METHODS:
            return True
        
        # Allow update/delete only if owner
        return obj.author == request.user