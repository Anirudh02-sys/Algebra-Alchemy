from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class IsolatingProblem(models.Model):
    original = models.CharField(max_length=100)
    tokens = models.JSONField()
    correct = models.JSONField()

    def __str__(self):
        return self.original
