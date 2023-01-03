from django.contrib.auth.models import AbstractBaseUser
from django.db import models

from users.managers import CustomUserManager


class UserRoles():
    ADMIN = 'admin'


class UserRolesChoices(models.TextChoices):
    ADMIN = UserRoles.ADMIN, UserRoles.ADMIN


class User(AbstractBaseUser):
    email = models.EmailField(unique=True, null=True, blank=True)
    organization = models.TextField(unique=False, null=True, blank=True)
    name = models.TextField(null=True ,blank=True)
    code = models.TextField(null=True ,blank=True)
    token = models.TextField(null=True, blank=True)
    image = models.ImageField(null=True ,blank=True)

    objects = CustomUserManager()

    def __str__(self):
        return str(self.email)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['organization']
    #
    # @property
    # def is_admin(self):
    #     return self.role == UserRoles.ADMIN
    #
    # @property
    # def profile_image(self):
    #     if self.logo:
    #         return self.logo.url
    #     else:
    #         return 'https://www.w3schools.com/howto/img_avatar.png'


