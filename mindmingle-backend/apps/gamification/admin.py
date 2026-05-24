from django.contrib import admin
from .models import Badge, UserBadge, Reputation, UserLevel

admin.site.register(Badge)
admin.site.register(UserBadge)
admin.site.register(Reputation)
admin.site.register(UserLevel)