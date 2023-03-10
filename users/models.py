import os
import uuid
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractBaseUser
from django.db import models
from django.dispatch import receiver
from users.managers import CustomUserManager
from django.contrib.auth.models import PermissionsMixin
# from django.db.models import UniqueConstraint
# from django.db.models.functions import Lower
from django.db.models import Q


class UserRoles():
    ADMIN = 'admin'
    VIEWER = 'viewer'


class UserRolesChoices(models.TextChoices):
    ADMIN = UserRoles.ADMIN, UserRoles.ADMIN


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, null=False, blank=False)
    organization = models.CharField(max_length=200, unique=True, null=False, blank=False, verbose_name='Organization Name')
    name = models.CharField(max_length=100, null=True, blank=True)
    code = models.CharField(max_length=100, null=True, blank=True)
    token = models.CharField(max_length=500, null=True, blank=True)
    address = models.CharField(max_length=100, null=True, blank=True)
    image = models.ImageField(upload_to='profiles/', null=True ,blank=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_organization = models.BooleanField(default=True)
    # class Meta:
    #     constraints = [
    #         models.UniqueConstraint(fields=['email', 'is_organization'], name='Organization with same constraint already exist')
    #     ]

    objects = CustomUserManager()

    def __str__(self):
        return str(self.organization)
    
    class Meta:
        verbose_name_plural = "Organizations"
        # constraints = [
        #     UniqueConstraint(
        #         Lower('organization'),
        #         name='Unique_Organization_Name',
        #         violation_error_message='Organization name is not unique',
        #     ),
        # ]

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
        
    def clean(self):
        if User.objects.filter(Q(organization__icontains=self.organization)).exclude(id=self.id).exists():
            raise ValidationError({'organization':"Organization name must be unique"})

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.lower()
        super(User, self).save(*args, **kwargs)


# User.objects.create(email="testaliaxghar@gmail.com", organization="fake", is_organization=False)

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
    
    class Meta:
        verbose_name_plural = "Users"
    
    # def __str__(self):
    #     return self.shared_to
    
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
                OrganizationPermissions.objects.create(shared_by=instance.shared_by, shared_to=shared_to, role=instance.role)


class LinkDevice(models.Model):
    organization = models.ForeignKey(User, on_delete=models.CASCADE, related_name='linked_organization')
    name = models.CharField(max_length=50, null=True, blank=True)
    device_id = models.CharField(unique=True, max_length=100, null=False, blank=False)
    description = models.TextField(null=True, blank=True)
    battery_voltage = models.FloatField(null=True, blank=True, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.device_id
    
    class Meta:
        verbose_name_plural = "Linked Devices"
        ordering = ['name',]
    
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
            self.name = self.device_id
        super(LinkDevice, self).save(*args, **kwargs)


class FavouriteDevice(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    device = models.ForeignKey(LinkDevice, on_delete=models.CASCADE, related_name="favourite_device")
    favourite = models.BooleanField(default=False)

    class Meta:
        ordering = ['-favourite',]


class Transactions(models.Model):
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bought_by')
    payment_intent = models.CharField(max_length=100, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


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


@receiver(models.signals.post_save, sender=LinkDevice)
def postsave_handler(sender, instance, created, **kwargs):
    if created:
        # print(instance.id)
        # print(instance.organization_id)
        FavouriteDevice.objects.create(user_id=instance.organization_id, device_id=instance.id)
        org = OrganizationPermissions.objects.filter(shared_by_id=instance.organization_id)
        if org:
            for obj in org:
                FavouriteDevice.objects.create(user_id=obj.shared_to_id, device_id=instance.id)


@receiver(models.signals.post_delete, sender=OrganizationPermissions)
def postdelete_handler(sender, instance, **kwargs):
    SharedOrganization.objects.filter(shared_to=instance.shared_to.email).delete()
    FavouriteDevice.objects.filter(user=instance.shared_to).delete()
    User.objects.filter(id=instance.shared_to_id).delete()


# @receiver(models.signals.pre_save, sender=OrganizationPermissions)
# def on_shared_by_update_handler(sender, instance, **kwargs):
#     print("pre_save event called")
#     org = OrganizationPermissions.objects.filter(shared_to=instance.shared_to).first()
#     if org:
#         if org.shared_by_id is not instance.shared_by_id:
#             FavouriteDevice.objects.filter(user_id=instance.shared_to_id).delete()
#             devices = FavouriteDevice.objects.filter(user=instance.shared_by)
#             if devices:
#                 for obj in devices:
#                     FavouriteDevice.objects.create(user=instance.shared_to, device_id=obj.device_id)

@receiver(models.signals.post_save, sender=OrganizationPermissions)
def on_shared_by_update_handler(sender, instance, created, **kwargs):
    print("post_save event called")
    shared_org = SharedOrganization.objects.filter(shared_to=instance.shared_to.email).first()
    if shared_org:
        if shared_org.shared_by != instance.shared_by:
            shared_org.shared_by = instance.shared_by
            shared_org.save(update_fields=['shared_by'])
            FavouriteDevice.objects.filter(user_id=instance.shared_to_id).delete()
            devices = FavouriteDevice.objects.filter(user=instance.shared_by)
            if devices:
                for obj in devices:
                    FavouriteDevice.objects.create(user=instance.shared_to, device_id=obj.device_id)
        if shared_org.role != instance.role:
            shared_org.role = instance.role
            shared_org.save(update_fields=['role'])