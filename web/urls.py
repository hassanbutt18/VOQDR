from django.urls import path
from . import views

urlpatterns = [
    path('invite_organization/', views.invite_organization, name='invite_organization'),
    path('reset_password/<str:pk>', views.reset_password, name='reset_password'),
    path('logout_view/', views.Logout, name='logout_view'),
    path('verify_code/<str:token>', views.verify_code, name='verify_code'),
    path('resend-code/<str:token>', views.resend_code, name='resend_code'),
    path('verify_codes/', views.verify_codes, name='verify_codes'),
    path('invitation-approval/<str:token>/<str:status>/', views.invitation_approval, name='invitation_approval'),
    path('forgot_password/', views.forgot_password, name='forgot_password'),
    path('signup/', views.signup, name='signup'),
    path('signin/', views.signin, name='signin'),
    path('accounts/', views.my_account, name='account'),
    path('map/', views.maps_vodcur, name='maps'),
    path('', views.index, name='index'),
]