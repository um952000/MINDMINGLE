# from django.db import models

# class Badge(models.Model):
#     name = models.CharField(max_length=100)
#     slug = models.SlugField(unique=True)
#     description = models.TextField()
#     icon = models.CharField(max_length=100)
    
#     class Meta:
#         verbose_name_plural = "Badges"

# class UserBadge(models.Model):
#     user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='badges')
#     badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
#     awarded_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         unique_together = ['user', 'badge']

# class Leaderboard(models.Model):
#     PERIOD_CHOICES = [('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly'), ('all_time', 'All Time')]
    
#     period = models.CharField(max_length=10, choices=PERIOD_CHOICES)
#     user = models.ForeignKey('core.User', on_delete=models.CASCADE)
#     score = models.IntegerField()
#     rank = models.IntegerField()
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         unique_together = ['period', 'user']
#         indexes = [models.Index(fields=['period', 'rank'])]
        
from django.db import models
from django.db.models import F


class Badge(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=100)      # emoji or icon name e.g. '🏆'
    points_required = models.IntegerField(default=0)  # reputation needed

    class Meta:
        verbose_name_plural = "Badges"

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    user = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='user_badges'
    )
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'badge']

    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"


class Reputation(models.Model):
    """Tracks every reputation change with reason"""
    REASON_CHOICES = [
        ('doubt_asked',       '+2 Asked a doubt'),
        ('answer_given',      '+5 Gave an answer'),
        ('answer_accepted',   '+15 Answer accepted'),
        ('doubt_upvoted',     '+3 Doubt upvoted'),
        ('answer_upvoted',    '+3 Answer upvoted'),
        ('doubt_downvoted',   '-1 Doubt downvoted'),
        ('answer_downvoted',  '-1 Answer downvoted'),
        ('streak_bonus',      '+10 Streak bonus'),
        ('badge_awarded',     '+20 Badge awarded'),
    ]

    user = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='reputation_logs'
    )
    points = models.IntegerField()               # can be negative
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} {self.points:+d} ({self.reason})"


class UserLevel(models.Model):
    """Tracks user level separately from User model"""
    LEVEL_CHOICES = [
        ('Beginner',     'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced',     'Advanced'),
        ('Expert',       'Expert'),
        ('Master',       'Master'),
    ]

    LEVEL_THRESHOLDS = {
        'Beginner':     0,
        'Intermediate': 200,
        'Advanced':     1000,
        'Expert':       5000,
        'Master':       10000,
    }

    user = models.OneToOneField(
        'core.User',
        on_delete=models.CASCADE,
        related_name='user_level'
    )
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='Beginner')
    total_reputation = models.IntegerField(default=0)
    streak_days = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.level}"

    def add_reputation(self, points, reason, description=''):
        """Add/subtract reputation and update level"""
        from django.db import transaction
        with transaction.atomic():
            # Log the change
            Reputation.objects.create(
                user=self.user,
                points=points,
                reason=reason,
                description=description
            )
            # Update total
            self.total_reputation = F('total_reputation') + points
            self.save(update_fields=['total_reputation'])
            self.refresh_from_db()

            # Update level
            self._update_level()

            # Check badges
            self._check_badges()

    def _update_level(self):
        for level, threshold in sorted(
            self.LEVEL_THRESHOLDS.items(),
            key=lambda x: x[1],
            reverse=True
        ):
            if self.total_reputation >= threshold:
                if self.level != level:
                    self.level = level
                    self.save(update_fields=['level'])
                break

    def _check_badges(self):
        """Auto-award badges based on reputation"""
        thresholds = {
            'reputation_100':  100,
            'reputation_500':  500,
            'reputation_1000': 1000,
            'reputation_5000': 5000,
        }
        for slug, threshold in thresholds.items():
            if self.total_reputation >= threshold:
                try:
                    badge = Badge.objects.get(slug=slug)
                    UserBadge.objects.get_or_create(user=self.user, badge=badge)
                except Badge.DoesNotExist:
                    pass

    def update_streak(self):
        """Call whenever user is active"""
        from datetime import date, timedelta
        today = date.today()
        if self.last_active_date is None:
            self.streak_days = 1
        elif self.last_active_date == today:
            return
        elif self.last_active_date == today - timedelta(days=1):
            self.streak_days += 1
        else:
            self.streak_days = 1
        self.last_active_date = today
        self.save(update_fields=['streak_days', 'last_active_date'])


class Leaderboard(models.Model):
    PERIOD_CHOICES = [
        ('daily',    'Daily'),
        ('weekly',   'Weekly'),
        ('monthly',  'Monthly'),
        ('all_time', 'All Time'),
    ]

    period = models.CharField(max_length=10, choices=PERIOD_CHOICES)
    user = models.ForeignKey('core.User', on_delete=models.CASCADE)
    score = models.IntegerField()
    rank = models.IntegerField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['period', 'user']
        indexes = [models.Index(fields=['period', 'rank'])]

    def __str__(self):
        return f"{self.period} - #{self.rank} {self.user.username} ({self.score})"
            