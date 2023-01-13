import os
from django.core.exceptions import ValidationError
from django.db import models
from django.dispatch import receiver


 
class ProductFeature(models.Model):
    title = models.CharField(max_length=500, null=False, blank=False)
    description = models.TextField(null=False, blank=False)
    image = models.ImageField(upload_to='products/', null=False ,blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.title



class Application(models.Model):
    title = models.CharField(max_length=500, null=False, blank=False)
    description = models.TextField(null=False, blank=False)
    image = models.ImageField(upload_to='applications/', null=False ,blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.title

class ApplicationImage(models.Model):
    image = models.ImageField(upload_to='applications/', null=False ,blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return str(self.image)
    
class Testimonial(models.Model):
    title = models.CharField(max_length=500, null=False, blank=False)
    author = models.CharField(max_length=100, null=False, blank=False)
    designation = models.CharField(max_length=100, null=False, blank=False)
    description = models.TextField(null=False, blank=False)
    image = models.ImageField(upload_to='testimonials/', null=False ,blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.title

class ContactUs(models.Model):
    name = models.CharField(max_length=100, null=False, blank=False)
    email = models.EmailField(null=False, blank=False)
    message = models.TextField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.email



@receiver(models.signals.post_save, sender=ApplicationImage)
def check_create_record(sender, instance, created, **kwargs):
    if not instance.pk:
        return False
    if created:
        if ApplicationImage.objects.count() > 1:
            instance.delete()



@receiver(models.signals.post_save, sender=ProductFeature)
def check_create_record(sender, instance, created, **kwargs):
    if not instance.pk:
        return False
    if created:
        if ProductFeature.objects.count() > 3:
            instance.delete()


@receiver(models.signals.post_save, sender=Application)
def check_create_record(sender, instance, created, **kwargs):
    if not instance.pk:
        return False
    if created:
        if Application.objects.count() > 3:
            instance.delete()
    

@receiver(models.signals.pre_save, sender=ProductFeature)
@receiver(models.signals.pre_save, sender=Application)
@receiver(models.signals.pre_save, sender=ApplicationImage)
@receiver(models.signals.pre_save, sender=Testimonial)
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

@receiver(models.signals.post_delete, sender=ProductFeature)
@receiver(models.signals.post_delete, sender=Application)
@receiver(models.signals.post_delete, sender=ApplicationImage)
@receiver(models.signals.post_delete, sender=Testimonial)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    if instance.image:
        if os.path.isfile(instance.image.path):
            os.remove(instance.image.path)