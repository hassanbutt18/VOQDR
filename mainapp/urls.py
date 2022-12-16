from django.urls import path

from . import views

urlpatterns = [
    path('map/', views.maps_vodcur, name='maps'),
    path('', views.index, name='index'),
]