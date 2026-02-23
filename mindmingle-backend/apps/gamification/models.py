from django.db import models

class Badge(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=100)
    
    class Meta:
        verbose_name_plural = "Badges"

class UserBadge(models.Model):
    user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'badge']

class Leaderboard(models.Model):
    PERIOD_CHOICES = [('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly'), ('all_time', 'All Time')]
    
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES)
    user = models.ForeignKey('core.User', on_delete=models.CASCADE)
    score = models.IntegerField()
    rank = models.IntegerField()
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['period', 'user']
        indexes = [models.Index(fields=['period', 'rank'])]
        