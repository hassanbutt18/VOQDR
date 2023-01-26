from django.contrib import admin
from django.contrib.auth.models import Group
from users.models import LinkDevice
admin.site.unregister(Group)


class AdminLinkDevice(admin.ModelAdmin):
    readonly_fields = ["device_id"]
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields
        else:
            return []

admin.site.register(LinkDevice, AdminLinkDevice)