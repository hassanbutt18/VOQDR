from django.contrib import admin
from django import forms
from django.db import models
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from users.models import LinkDevice, User
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.admin import UserAdmin
from django_toggle_switch_widget.widgets import DjangoToggleSwitchWidget
admin.site.unregister(Group)


class MyModelForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        user_model = get_user_model()
        self.fields['organization'].queryset = user_model.objects.filter(is_superuser=False, is_organization=True)

class AdminLinkDevice(admin.ModelAdmin):
    readonly_fields = ["device_id", "battery_voltage"]
    list_display= ('device_id', 'name', 'organization')
    search_fields= ('device_id', 'name', 'organization__organization')
    exclude = ('battery_voltage', 'favourite')
    form = MyModelForm
    # def get_organization_name(self, obj):
    #     return obj.organization.organization
    # get_organization_name.short_description = 'Organization'

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields
        else:
            return []

admin.site.register(LinkDevice, AdminLinkDevice)


# class UserModelForm(forms.ModelForm):
#     class Meta:
#         model = User
#         fields = "__all__"
#         widgets = {
#             "is_active": DjangoToggleSwitchWidget(round=True, klass="django-toggle-switch-dark-primary"),
#         }



class UserModelAdmin(admin.ModelAdmin):
    readonly_fields = ["email", "is_organization"]
    list_display = ('email', 'name', 'organization', 'is_organization', 'is_active')
    # list_editable = ('is_active',)
    # search_fields= ('device_id', 'name', 'organization__organization')
    exclude = ('code', 'token', 'is_staff', 'is_superuser', 'user_permissions', 'groups', 'last_login', 'password')
    # form = UserModelForm
    formfield_overrides = {
        models.BooleanField: {'widget': DjangoToggleSwitchWidget(round=True, klass="django-toggle-switch-dark-primary")},
    }
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields
        else:
            return []
        
    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions

    def has_delete_permission(self, request, obj=None):
        return False

    def has_delete_selected_permission(self, request, queryset=None):
        return False

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            qs = qs.exclude(is_superuser=True)
        return qs
    
    
admin.site.register(User, UserModelAdmin)