from django.urls import path

from . import views

urlpatterns = [
    path('accounts/', views.my_account, name='account'),
    path('map/', views.maps_vodcur, name='maps'),
    path('', views.index, name='index'),
]