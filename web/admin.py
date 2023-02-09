from django.contrib import admin
from web.models import ProductFeature, Testimonial, Application, ApplicationImage, ContactUs



class AdminProductFeature(admin.ModelAdmin):
    def has_add_permission(self, request):
        features = ProductFeature.objects.count()
        if features == 3:
            return False
        else:
            return True


class AdminApplication(admin.ModelAdmin):
    def has_add_permission(self, request):
        application = Application.objects.count()
        if application == 3:
            return False
        else:
            return True


class AdminApplicationImage(admin.ModelAdmin):
    def has_add_permission(self, request):
        application_image = ApplicationImage.objects.count()
        if application_image == 1:
            return False
        else:
            return True

admin.site.register(ProductFeature, AdminProductFeature)
admin.site.register(Testimonial)
admin.site.register(Application, AdminApplication)
admin.site.register(ApplicationImage, AdminApplicationImage)
admin.site.register(ContactUs)


admin.site.site_header  =  "VOQDR Administration" 