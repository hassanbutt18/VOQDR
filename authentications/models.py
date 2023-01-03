from django.db import models


# Create your models here.
class Otp_types(models.TextChoices):
    create = 'create', 'create'
    forgot = 'forgot', 'forgot'
    changenumber = 'changenumber', 'changenumber'


class OTP(models.Model):
    email  = models.EmailField(max_length=100)
    code = models.IntegerField(null=True)
    type = models.CharField(max_length=100,null=True , choices=Otp_types.choices, blank=True)
    verification_token = models.CharField(max_length=200 , null=True)
    use = models.BooleanField(default=False ,null=True)
    role = models.CharField(max_length=100, null=True)
    timeout = models.DateTimeField(null=True)
    created_at = models.DateTimeField(null=True)

    def __str__(self):
        return self.email
