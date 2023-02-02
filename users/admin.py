from django.contrib import admin
from django.contrib.auth.models import Group
from users.models import LinkDevice
admin.site.unregister(Group)


class AdminLinkDevice(admin.ModelAdmin):
    readonly_fields = ["device_id", "battery_voltage"]
    list_display= ('device_id', 'name', 'organization')
    search_fields= ('device_id', 'name', 'organization__organization')
    exclude = ('battery_voltage', 'device_order_id')

    # def get_organization_name(self, obj):
    #     return obj.organization.organization
    # get_organization_name.short_description = 'Organization'

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields
        else:
            return []

admin.site.register(LinkDevice, AdminLinkDevice)