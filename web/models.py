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
    
    def clean(self):
        features = ProductFeature.objects.filter().exclude(id=self.id)
        if len(features) == 3:
            raise ValidationError("More than 3 product features cannot be added at one time")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super(ProductFeature, self).save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Product Feature"



class Application(models.Model):
    title = models.CharField(max_length=500, null=False, blank=False)
    description = models.TextField(null=False, blank=False)
    image = models.ImageField(upload_to='applications/', null=False ,blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.title

    def clean(self):
        application = Application.objects.filter().exclude(id=self.id)
        if len(application) == 3:
            raise ValidationError("More than 3 applications cannot be added at one time")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super(Application, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name_plural = "Application"



class ApplicationImage(models.Model):
    image = models.ImageField(upload_to='applications/', null=False ,blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return str(self.image)
    
    def clean(self):
        app_img = ApplicationImage.objects.filter().exclude(id=self.id)
        if len(app_img) == 1:
            raise ValidationError("More than 1 application image cannot be added at one time")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super(ApplicationImage, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name_plural = "Application Image"


    
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
    
    class Meta:
        verbose_name_plural = "Testimonial"



class ContactUs(models.Model):
    name = models.CharField(max_length=100, null=False, blank=False)
    email = models.EmailField(null=False, blank=False)
    message = models.TextField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.email
    
    class Meta:
        verbose_name_plural = "Contact Us"



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