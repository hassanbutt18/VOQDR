from django.contrib.auth.models import AbstractBaseUser
from django.db import models

from users.managers import CustomUserManager


class UserRoles():
    ADMIN = 'admin'
    VIEWER = 'viewer'


class UserRolesChoices(models.TextChoices):
    ADMIN = UserRoles.ADMIN, UserRoles.ADMIN


class User(AbstractBaseUser):
    email = models.EmailField(unique=True, null=True, blank=True)
    organization = models.TextField(unique=False, null=True, blank=True)
    name = models.CharField(max_length=100, null=True, blank=True)
    code = models.CharField(max_length=100, null=True, blank=True)
    token = models.CharField(max_length=500, null=True, blank=True)
    address = models.CharField(max_length=100, null=True, blank=True)
    image = models.ImageField(upload_to='profiles/', null=True ,blank=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)



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
    @property
    def profile_image(self):
        if self.image:
            return self.image.url
        else:
            return 'https://www.w3schools.com/howto/img_avatar.png'




class SharedOrganization(models.Model):
    invite_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_by_organization')
    invite_to = models.EmailField(null=True, blank=True)
    role = models.CharField(max_length=15, default=UserRoles.VIEWER)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.invite_to



class InvitedOrganization(models.Model):
    invite_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invite_by_organization')
    invite_to = models.EmailField(null=True, blank=True)
    role = models.CharField(max_length=15, default=UserRoles.VIEWER)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.invite_to



class OrganizationPermissions(models.Model):
    invite_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invited_by_organization')
    invite_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_organization')
    role = models.CharField(max_length=15, default=UserRoles.VIEWER)
    def __str__(self):
        return self.invite_to