from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse
# Create your views here.


def index(request):
    template = loader.get_template('mainapp/index.html')
    return HttpResponse(template.render())

def maps_vodcur(request):
    template = loader.get_template('mainapp/maps.html')
    return HttpResponse(template.render())

def my_account(request):
    template = loader.get_template('mainapp/account.html')
    return HttpResponse(template.render())