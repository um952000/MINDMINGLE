from django.db import models
from django.db.models import Q

# ============================
# TAG MODEL (Better than JSONField)
# ============================

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# ============================
# DOUBT MODEL (Like Question)
# ============================

class Doubt(models.Model):
    author = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='doubts'
    )
    
    title = models.CharField(max_length=300)
    content = models.TextField()

    # Many-to-many tag system (better than JSONField)
    tags = models.ManyToManyField(Tag, related_name='doubts', blank=True)

    ai_summary = models.TextField(blank=True)

    # Voting
    upvotes = models.ManyToManyField(
        'core.User',
        related_name='upvoted_doubts',
        blank=True
    )

    downvotes = models.ManyToManyField(
        'core.User',
        related_name='downvoted_doubts',
        blank=True
    )

    answers_count = models.IntegerField(default=0)
    views_count = models.IntegerField(default=0)

    is_trending = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    is_resolved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['is_trending', 'created_at']),
            models.Index(fields=['is_public', 'created_at']),
        ]

    def __str__(self):
        return self.title


# ============================
# MULTIPLE IMAGES FOR DOUBT
# ============================

class DoubtImage(models.Model):
    doubt = models.ForeignKey(
        Doubt,
        related_name='images',
        on_delete=models.CASCADE
    )

    image = models.ImageField(upload_to='doubt_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.doubt.title}"


# ============================
# ANSWER MODEL
# ============================

class Answer(models.Model):
    doubt = models.ForeignKey(
        Doubt,
        on_delete=models.CASCADE,
        related_name='answers'
    )

    author = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE
    )

    content = models.TextField()
    ai_summary = models.TextField(blank=True)

    is_accepted = models.BooleanField(default=False)

    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies'
    )

    upvotes = models.ManyToManyField(
        'core.User',
        related_name='upvoted_answers',
        blank=True
    )

    downvotes = models.ManyToManyField(
        'core.User',
        related_name='downvoted_answers',
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['doubt', 'created_at']),
            models.Index(fields=['parent']),
        ]

        # Only one accepted answer per doubt
        constraints = [
            models.UniqueConstraint(
                fields=['doubt'],
                condition=Q(is_accepted=True),
                name='only_one_accepted_answer_per_doubt'
            )
        ]

    def __str__(self):
        return f"Answer by {self.author}"


# ============================
# REACTION MODEL (For Doubt & Answer)
# ============================

class Reaction(models.Model):

    REACTION_CHOICES = [
        ('like', 'Like'),
        ('dislike', 'Dislike'),
        ('love', 'Love'),
        ('insightful', 'Insightful'),
        ('funny', 'Funny'),
    ]

    user = models.ForeignKey('core.User', on_delete=models.CASCADE)

    doubt = models.ForeignKey(
        Doubt,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    answer = models.ForeignKey(
        Answer,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    reaction_type = models.CharField(max_length=20, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            # One reaction per user per doubt
            models.UniqueConstraint(
                fields=['user', 'doubt'],
                condition=Q(answer__isnull=True),
                name='unique_user_doubt_reaction'
            ),

            # One reaction per user per answer
            models.UniqueConstraint(
                fields=['user', 'answer'],
                condition=Q(doubt__isnull=True),
                name='unique_user_answer_reaction'
            ),
        ]

        indexes = [
            models.Index(fields=['reaction_type', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user} reacted {self.reaction_type}"


# ============================
# COMMENT MODEL
# ============================

class Comment(models.Model):
    author = models.ForeignKey('core.User', on_delete=models.CASCADE)

    doubt = models.ForeignKey(
        Doubt,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    answer = models.ForeignKey(
        Answer,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    content = models.TextField()

    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies'
    )

    likes_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Comment by {self.author}"
    
    