from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse
# Create your views here.


def index(request):
    template = loader.get_template('web/index.html')
    return HttpResponse(template.render())

def maps_vodcur(request):
    template = loader.get_template('web/maps.html')
    return HttpResponse(template.render())

def my_account(request):
    template = loader.get_template('web/account.html')
    return HttpResponse(template.render())

def signin(request):
    template = loader.get_template('web/signin.html')
    return HttpResponse(template.render())

def signup(request):
    template = loader.get_template('web/signup.html')
    return HttpResponse(template.render())

def forgot_password(request):
    template = loader.get_template('web/forgot_password.html')
    return HttpResponse(template.render())

def verify_code(request):
    template = loader.get_template('web/verify_code.html')
    return HttpResponse(template.render())

def reset_password(request):
    template = loader.get_template('web/reset_password.html')
    return HttpResponse(template.render())