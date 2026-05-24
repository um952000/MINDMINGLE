from rest_framework.pagination import CursorPagination

class UserCursorPagination(CursorPagination):
    page_size = 20
    ordering = '-created_at'  # Assuming you have a 'created_at' field in your User model to order by