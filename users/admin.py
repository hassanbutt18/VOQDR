from django.contrib import admin
from django import forms
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from users.models import LinkDevice
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
    exclude = ('battery_voltage', 'device_order_id')
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