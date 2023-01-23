from django.contrib import admin
from django.contrib.auth.models import Group
from users.models import LinkDevice
admin.site.unregister(Group)
admin.site.register(LinkDevice)

