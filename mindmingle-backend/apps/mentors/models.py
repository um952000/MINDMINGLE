from django.db import models
from django.conf import settings
from django.db.models import Avg

class MentorProfile(models.Model):
    
    CATEGORY_CHOICES = [
        ('technology', 'Technology'),
        ('design', 'Design'),
        ('business', 'Business'),
        ('marketing', 'Marketing'),
        ('science', 'Science'),
        ('mathematics', 'Mathematics'),
        ('language', 'Language'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    
    #Professional Information
    tagline = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, blank=True)
    expertise = models.JSONField(blank=True, default=list)  # List of expertise areas
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    languages = models.JSONField(blank=True, default=list)  # List of languages spoken
    
    #Pricing Information
    monthly_price = models.DecimalField(max_digits=10, decimal_places=2)
    session_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default='INR')
    
    #Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_accepting_students = models.BooleanField(default=True)
    
    #stats
    total_subscribers = models.PositiveIntegerField(default=0)
    total_sessions = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.PositiveIntegerField(default=0)
    
    #Media
    intro_video_url = models.URLField(blank=True)
    banner_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-total_subscribers']
        
    def __str__(self):
        return f"{self.user.username}'s Mentor Profile"    
    
    def update_rating(self):
        """call this after every new review is added to update the average rating and total reviews"""
        result = self.reviews.aggregate(Avg('rating'))
        self.average_rating = result['rating__avg'] or 0
        self.total_reviews = self.reviews.count()
        self.save(update_fields=['average_rating', 'total_reviews'])
    
    @property
    def platform_cut(self):
        return round(self.session_price * 0.12, 2)
    
    @property
    def mentor_earnings_per_sub(self):
        return round(self.monthly_price * 0.88, 2)
    
    
class MentorApplication(models.Model):
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='mentor_application'
    )
    motivation = models.TextField()
    sample_work = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} application ({self.status})"


class MentorReview(models.Model):
    
    mentor = models.ForeignKey(MentorProfile,
        on_delete=models.CASCADE, 
        related_name='reviews'
    )
    
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    rating = models.PositiveIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['mentor', 'reviewer'],
                name='unique_mentor_review'
            )
        ]

    def __str__(self):
        return f"{self.reviewer.username} → {self.mentor.user.username} ({self.rating}★)"
    
    # After saving a review, we need to update the mentor's average rating and total reviews
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # auto update mentor rating after every review
        self.mentor.update_rating()