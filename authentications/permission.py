
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


class StoreUser(permissions.BasePermission):
    message = {'error': 'You cannot proceed you are not Business'}

    def has_permission(self, request, view):
        if request.user.is_authenticated and request.user.is_business:
            return True
        else:
            return False


class BuyerUser(permissions.BasePermission):
    message = {'error': 'You cannot proceed you are not the buyer'}

    def has_permission(self, request, view):
        if request.user.is_authenticated and request.user.is_buyer:
            return True
        else:
            return False



    
class BuyerRequired:
    @method_decorator(login_required(login_url='/login/'))
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_buyer:
            return super().dispatch(request, *args, **kwargs)
        else:
            raise PermissionDenied