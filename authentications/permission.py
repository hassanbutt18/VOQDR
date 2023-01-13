from rest_framework import permissions
from rest_framework.response import Response
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import permission_required as pr
from django.core.exceptions import PermissionDenied

from StocksMaze.decorators import buyer_only

class AdminUser(permissions.BasePermission):
    message = {'error': 'You cannot proceed you are not admin '}

    def has_permission(self, request, view):
        if request.user.is_authenticated and request.user.is_superuser:
            return True
        else:
            return False


