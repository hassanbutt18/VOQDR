from django.db import models


# Create your models here.
class Otp_types(models.TextChoices):
    create = 'create', 'create'
    forgot = 'forgot', 'forgot'
    changenumber = 'changenumber', 'changenumber'


class OTP(models.Model):
    phone_number = models.CharField(max_length=100)
    code = models.IntegerField(null=True)
    type = models.CharField(max_length=100, choices=Otp_types.choices, blank=True)
    verification_token = models.CharField(max_length=200)
    use = models.BooleanField(default=False)
    role = models.CharField(max_length=100 ,default='buyer')
    timeout = models.DateTimeField()
    created_at = models.DateTimeField(null=True)

    def __str__(self):
        return self.phone_number
