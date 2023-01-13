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
    path('edit-organization-role/<str:pk>', views.edit_organization_role, name='edit_organization_role'),
    path('edit-organization-details/<str:pk>', views.edit_organization_details, name='edit_organization_details'),
    path('get-organization-details/<str:pk>/', views.get_organization_details, name='get_organization_details'),
    path('remove-shared-organization/<str:pk>/', views.remove_shared_organization, name='remove_shared_organization'),
    path('contact-us/', views.contact_us, name='contact_us'),
    path('', views.index, name='index'),
]