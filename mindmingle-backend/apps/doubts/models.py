from django.db import models

class Doubt(models.Model):
    author = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='doubts')
    title = models.CharField(max_length=300)
    content = models.TextField()
    img = models.ImageField(upload_to='doubt_images/', null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)  # List of tags
    ai_summary = models.TextField(blank=True)  # AI-generated summary of the doubt
    
    #Other users engaging with the doubt
    upvotes = models.ManyToManyField('core.User', related_name='upvoted_doubts', blank=True)
    downvotes = models.ManyToManyField('core.User', related_name='downvoted_doubts', blank=True)
    
    answers_count = models.IntegerField(default=0)  # To track number of answers
    views_count = models.IntegerField(default=0)  # To track number of views
    is_trending = models.BooleanField(default=False)  # To track if the doubt is trending
    
    is_public = models.BooleanField(default=True)  # To control visibility of the doubt
    is_resolved = models.BooleanField(default=False)  # To track if the doubt is resolved
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    
    class Meta:
        indexes = [
            models.Index(fields=['is_trending', 'created_at']),
            models.Index(fields=['tags']),
            models.Index(fields=['is_public', 'created_at']),
        ]
        
class Answer(models.Model):
    doubt = models.ForeignKey(Doubt, on_delete=models.CASCADE, related_name='answers')
    author = models.ForeignKey('core.User', on_delete=models.CASCADE)
    content = models.TextField()
    ai_summary = models.TextField(blank=True)  # AI-generated summary of the 
    is_accepted = models.BooleanField(default=False)  # To track if the answer is accepted
    
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies'
    )
    
    upvotes = models.ManyToManyField('core.User', related_name='upvoted_answers', blank=True)
    downvotes = models.ManyToManyField('core.User', related_name='downvoted_answers', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['doubt', 'created_at']),
            models.Index(fields=['parent']),
        ]

class Reaction(models.Model):
    
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('dislike', 'Dislike'),
        ('love', 'Love'),
        ('insightful', 'Insightful'),
        ('funny', 'Funny'),
    ]  # To track different types of reactions
    
    user = models.ForeignKey('core.User', on_delete=models.CASCADE)
    doubt  = models.ForeignKey(Doubt, on_delete=models.CASCADE, null=True, blank=True)
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, null=True, blank=True)
    reaction_type = models.CharField(max_length=20, choices=REACTION_CHOICES)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'doubt', 'answer'] # To prevent duplicate reactions
        indexes = [
            models.Index(fields=['reaction_type', 'created_at']),
        ]
        
class Comment(models.Model):
    author = models.ForeignKey('core.User', on_delete=models.CASCADE)
    doubt  = models.ForeignKey(Doubt, on_delete=models.CASCADE, null=True, blank=True)
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, null=True, blank=True)
    content = models.TextField()
    
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies'
    )
    
    likes_count = models.IntegerField(default=0)  # To track number of likes
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
        ]            
    
             