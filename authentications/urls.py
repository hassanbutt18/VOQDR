from django.urls import path, include
from rest_framework.routers import SimpleRouter

from . import views

router = SimpleRouter()

router.register('generate', views.OtpGenerateViewSet, basename='generate_otp')
router.register('verify', views.OtpVerificationViewSet, basename='verify_otp')
router.register('forgot', views.OtpForgotViewSet, basename='forgot_otp')
router.register('update', views.OtpUpdateViewSet, basename='update_otp')

urlpatterns = [
    path('otp/', include(router.urls)),
]
