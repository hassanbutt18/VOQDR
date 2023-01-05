from random import randint

from django.core.mail import send_mail
from django.shortcuts import render, redirect
from django.template import loader
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from django.urls import reverse

from authentications.models import OTP
from authentications.services import get_otp_verified_token
from users.models import User
from voqdr.services import otp_number
from django.contrib.auth.decorators import login_required


# user = User.objects.count()
# print("User",user)
# Create your views here.

def otp_number():
    return str(randint(1000, 9999))



def index(request):
    return render(request, 'web/index.html')


def maps_vodcur(request):
    context={'nbar':'map'}
    return render(request, 'web/maps.html', context)


def my_account(request):
    return render(request, 'web/account.html')


# @csrf_exempt
def signin(request):
    if request.user.is_authenticated:
        return redirect('/')
    if request.method == "POST":
        email = request.POST['email']
        password = request.POST['password']
        user = authenticate(request, email=email, password=password)
        print("here", user)
        if user:
            login(request, user)
            return redirect('maps')
        else:
            msg = 'Incorrect Password, try again'
            context = {"msg": msg}
            return render(request, 'web/signin.html', context)
    return render(request, 'web/signin.html')


def signup(request):
    msg = None
    success = False
    context = {}
    if request.method == "POST":
        organization = request.POST.get('organization', None)
        email = request.POST.get('email', None)
        password = request.POST.get('password', None)
        confirmpassword = request.POST.get('confirmpassword', None)
        if organization is None:
            msg = "Enter a valid organization!"
        elif email is None:
            msg = "Enter a valid email!"
        elif password is None:
            msg = "Provide valid password"
        elif confirmpassword is None:
            msg = "Enter a confirm password!"
        elif password != confirmpassword:
            msg = "Password does not match"
        elif User.objects.filter(email=email).exists():
            msg = "You are already exist continue to login"
        else:
            user = User.objects.create_user(email=email, password=password, organization=organization)
            if user:
                return redirect('signin')
        context["msg"] = msg
        context["success"] = success
        return JsonResponse(context)
    return render(request, 'web/signup.html', {})


def forgot_password(request):
    if request.method == "POST":
        email = request.POST.get('email', '')
        user = User.objects.filter(email=email).first()
        if user:
            secret_key = str(randint(1000, 9999))
            print("That is my secret key", secret_key)
            verification_token = get_otp_verified_token(email=email)
            print("That is my verification code and token", verification_token)
            update_code = User.objects.filter(id=user.id).update(code=secret_key, token=verification_token)
            if update_code:
                status = send_mail(
                    'Use the following code to get to the next step and reset your password.',
                    secret_key,
                    'voqdr.site@gmail.com',
                    [email],
                    fail_silently=False,
                )

                return redirect('verify_code', pk=verification_token)
    user = User.objects.filter(id=request.user.id)
    if user:
        return render(request, 'web/forgot_password.html')
    return render(request, 'web/forgot_password.html')


def verify_code(request, pk):
    if request.method == "POST":
        code = request.POST['code']
        user = User.objects.filter(token=pk).first()
        if user:
            if code == user.code:
                return redirect('reset_password', pk=user.token)
            else:
                return render(request, 'web/verify_code.html', context={"msg": "Otp code is invalid"})
        else:
            return render(request, 'web/verify_code.html', context={"msg": "User not found "})

    return render(request, 'web/verify_code.html')


def verify_codes(request):
    if request.method == "POST":
        print("I cam here")
        code = request.POST['code']
        token = request.POST['token']
        otp = OTP.objects.filter(token=token, type='forgot').order_by('-pk').first()
        if otp.code == code:
            print("I am in here dear")
            return render(request, 'web/verify_code.html', context={"token": otp.verification_token})
    return render(request, 'web/verify_code.html')


def reset_password(request, pk):
    if request.method == "POST":
        password = request.POST['mypassword']
        confirm_password = request.POST['confirm_password']
        if not password and not confirm_password:
            msg = 'Please enter both password fields.'
            return render(request, 'web/reset_password.html', context={"msg": msg})
        if not password or not confirm_password:
            msg = 'Please enter both password fields.'
            return render(request, 'web/reset_password.html', context={"msg": msg})
        elif password != confirm_password:
            msg = "Password fields didn't match."
            return render(request, 'web/reset_password.html', context={"msg": msg})
        elif len(password) < 8:
            msg = 'Password should be at least 8 characters.'
            return render(request, 'web/reset_password.html', context={"msg": msg})
        user = User.objects.filter(token=pk).first()
        user.set_password(password)
        user.save()
        return redirect('signin')
    return render(request, 'web/reset_password.html')


def Logout(request):
    logout(request)
    return redirect('signin')