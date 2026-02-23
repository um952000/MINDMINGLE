from django.contrib import admin
from .models import Doubt, Comment, Reaction, Answer

admin.site.register(Doubt)  
admin.site.register(Comment)
admin.site.register(Reaction)
admin.site.register(Answer)

# Register your models here.
