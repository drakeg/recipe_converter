from django.db import models
from django.contrib.auth.models import User
from typing import Optional

class Profile(models.Model):
    user: User = models.OneToOneField(User, on_delete=models.CASCADE)
    paid_subscription: bool = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"Profile for {self.user.username}"
