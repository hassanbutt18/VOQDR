import os
import uuid
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractBaseUser
from django.db import models
from django.dispatch import receiver
from users.managers import CustomUserManager
from django.contrib.auth.models import PermissionsMixin


class UserRoles():
    ADMIN = 'admin'
    VIEWER = 'viewer'


class UserRolesChoices(models.TextChoices):
    ADMIN = UserRoles.ADMIN, UserRoles.ADMIN


class User(AbstractBaseUser, PermissionsMixin):
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
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_by_organization')
    shared_to = models.EmailField(null=True, blank=True)
    role = models.CharField(max_length=15, default=UserRoles.VIEWER)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.shared_to

class Dummy(models.Model):
    role = models.CharField(max_length=15, default=UserRoles.VIEWER)

    def __str__(self):
        return self.role

class InvitedOrganization(models.Model):
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invite_by_organization')
    shared_to = models.EmailField(null=True, blank=True)
    role = models.CharField(max_length=15, default=UserRoles.VIEWER)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.shared_to



class OrganizationPermissions(models.Model):
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_from_organization')
    shared_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_with_organization')
    role = models.CharField(max_length=15, default=UserRoles.VIEWER)
    def __str__(self):
        return self.shared_to

    @staticmethod
    def create_organization_permissions(instance):
        try:
            shared_to = User.objects.get(email=instance.shared_to)
        except Exception as e:
            shared_to = None
        if shared_to:
            try:
                org = OrganizationPermissions.objects.get(shared_by=instance.shared_by, shared_to=shared_to)
                if org:
                    org.role = instance.role
                    org.save(update_fields=['role'])
            except Exception as e:
                print(e)
                OrganizationPermissions.objects.create(shared_by=instance.shared_by, shared_to=shared_to, role=instance.role)


class LinkDevice(models.Model):
    organization = models.ForeignKey(User, on_delete=models.CASCADE, related_name='linked_organization')
    name = models.CharField(max_length=50, null=True, blank=True)
    device_id = models.CharField(unique=True, max_length=100, null=False, blank=False)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name + ", " + self.organization.organization
    
    class Meta:
        verbose_name_plural = "Linked Devices"
    
    def clean(self):
        try:
            if self.organization == None:
                raise ValidationError("Please select an organization")
            if ' ' in self.device_id:
                raise ValidationError("Device id cannot contain spaces") 
        except Exception as e:
            raise ValidationError(e)

    def save(self, *args, **kwargs):
        if self.name == None:
            self.name = self.device_Id
        super(LinkDevice, self).save(*args, **kwargs)




@receiver(models.signals.post_save, sender=User)
def new_organization_permissions(sender, instance, created, **kwargs):
    if created:
        created_user_shared = SharedOrganization.objects.filter(shared_to=instance.email)
        if created_user_shared:
            for i in created_user_shared:
                i.is_verified = True
                i.save(update_fields=['is_verified'])




@receiver(models.signals.pre_save, sender=User)
def auto_update_file_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return False
    try:
        old_image_file = sender.objects.get(pk=instance.pk).image
    except sender.DoesNotExist:
        return False
    if old_image_file:
        new_image_file = instance.image
        if not old_image_file == new_image_file:
            if os.path.isfile(old_image_file.path):
                os.remove(old_image_file.path)


@receiver(models.signals.post_delete, sender=User)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    if instance.image:
        if os.path.isfile(instance.image.path):
            os.remove(instance.image.path)


@receiver(models.signals.post_save, sender=SharedOrganization)
def organization_permissions(sender, instance, created, **kwargs):
    if created:
        OrganizationPermissions.create_organization_permissions(instance)
    else:
        OrganizationPermissions.create_organization_permissions(instance)


@receiver(models.signals.pre_save, sender=LinkDevice)
def presave_handler(sender, instance, **kwargs):
    instance.full_clean()
