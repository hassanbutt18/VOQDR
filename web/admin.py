from django.contrib import admin
from django.db import models
from django import forms
from web.models import Home, PrivacyPolicy, ProductFeature, TermsAndConditions, Testimonial, Application, ApplicationImage, ContactUs
from ckeditor.widgets import CKEditorWidget


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


class TermsAndConditionsForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorWidget())

    class Meta:
        model = TermsAndConditions
        fields = ['content']


class AdminTermsAndConditions(admin.ModelAdmin):
    # formfield_overrides = {
    #     models.TextField: {'widget': CKEditorWidget}
    # }
    def has_add_permission(self, request):
        terms = TermsAndConditions.objects.count()
        if terms == 1:
            return False
        else:
            return True
    def has_delete_permission(self, request, obj=None):
        return False


class PrivacyPolicyForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorWidget())

    class Meta:
        model = PrivacyPolicy
        fields = ['content']

class AdminPrivacyPolicy(admin.ModelAdmin):
    # formfield_overrides = {
    #     models.TextField: {'widget': CKEditorWidget}
    # }
    def has_add_permission(self, request):
        policies = PrivacyPolicy.objects.count()
        if policies == 1:
            return False
        else:
            return True
    def has_delete_permission(self, request, obj=None):
        return False


class AdminHome(admin.ModelAdmin):
    def has_add_permission(self, request):
        obj = Home.objects.count()
        if obj == 4:
            return False
        else:
            return True


admin.site.register(ProductFeature, AdminProductFeature)
admin.site.register(Testimonial)
admin.site.register(Application, AdminApplication)
admin.site.register(ApplicationImage, AdminApplicationImage)
admin.site.register(ContactUs)
admin.site.register(TermsAndConditions, AdminTermsAndConditions)
admin.site.register(PrivacyPolicy, AdminPrivacyPolicy)
admin.site.register(Home, AdminHome)


admin.site.site_header  =  "VOQDR Administration" 