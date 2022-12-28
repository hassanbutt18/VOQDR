from django.shortcuts import render, redirect
from django.template import loader
from django.contrib.auth import authenticate, login
from django.http import HttpResponse
from users.models import User


# user = User.objects.count()
# print("User",user)
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


# @csrf_exempt
def signin(request):
    if request.method == "POST":
        email = request.POST['email']
        password = request.POST['password']
        user = authenticate(request, email=email, password=password)
        if user:
            login(request, user)
            return redirect('maps')
        else:
            msg = 'Incorrect Password, try again'
            context = {"msg": msg}
            return render(request, 'web/signin.html', context)
    return render(request, 'web/signin.html')

def signup(request):
    if request.method == "POST":
        organization = request.POST['organization']
        email = request.POST['email']
        password = request.POST['password']
        confirmpassword = request.POST['confirmpassword']
        user = User.objects.filter(email=email)
        if user:
            context = {"msg": "You are already exist continue to login"}
            return render(request, 'web/signup.html', context)
        else:
            if password != confirmpassword:
                context = {"msg": "Password does not match"}
                return render(request, 'web/signup.html', context)
            else:
                user = User.objects.create_user(email=email, password=password ,organization=organization)
                context = {"msg": "You have successfully registered"}
                return render(request, 'web/signup.html', context)
    return render(request, 'web/signup.html')


def forgot_password(request):
    template = loader.get_template('web/forgot_password.html')
    return HttpResponse(template.render())


def verify_code(request):
    template = loader.get_template('web/verify_code.html')
    return HttpResponse(template.render())


def reset_password(request):
    template = loader.get_template('web/reset_password.html')
    return HttpResponse(template.render())
