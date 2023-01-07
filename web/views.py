import json
from random import randint

from django.core.mail import send_mail
from django.shortcuts import render, redirect
from django.template import loader
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from django.urls import reverse

from authentications.models import OTP
from authentications.services import *
from users.models import User
from voqdr.services import otp_number
from django.contrib.auth.decorators import login_required


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
    msg = None
    success = False
    context = {}
    if request.user.is_authenticated:
        return redirect('/')
    if request.method == "POST":
        request_data = request.body.decode('utf-8')
        request_data = json.loads(request_data)
        try:
            user = User.objects.get(email=request_data.get('email'))
        except Exception as e:
            user = None
        if user is None:
            msg = 'You are not registered, signup first'
        elif not user.check_password(request_data.get('password')):
            msg = 'Incorrect password, try again'
        else:
            login(request, user)
            success = True
        context["msg"] = msg
        context["success"] = success
        return JsonResponse(context)
    return render(request, 'web/signin.html')


def signup(request):
    msg = None
    success = False
    context = {}
    if request.method == "POST":
        request_data = json.loads(request.body.decode('utf-8'))
        if User.objects.filter(email=request_data.get('email')).exists():
            msg = "You are already exist, continue to sign in"
        else:
            del request_data["csrfmiddlewaretoken"]
            del request_data["confirmpassword"]
            user = User.objects.create_user(**request_data)
            if user:
                success = True
                msg = 'User registered successfully.'
        context["msg"] = msg
        context["success"] = success
        return JsonResponse(context)
    return render(request, 'web/signup.html', context)


def generate_email(email):
    secret_key = str(randint(1000, 9999))
    verification_token = get_otp_verified_token(email=email)
    update_code = User.objects.filter(email=email).update(code=secret_key, token=verification_token)
    if update_code:
        try:
            status = send_mail(
                'Use the following code to get to the next step and reset your password.',
                secret_key,
                'voqdr.site@gmail.com',
                [email],
                fail_silently=False,
            )
        except Exception as e:
            print(e)
    return verification_token
    

def forgot_password(request):
    msg = None
    success = False
    token = None
    context = {}
    if request.method == "POST":
        request_data = json.loads(request.body.decode('utf-8'))
        email = request_data.get('email')
        user = User.objects.filter(email=email).first()
        if user is None:
            msg = "Enter your registered email." 
        else:
            token = generate_email(email)
            success = True
        context["success"] = success
        context["msg"] = msg
        context["token"] = token
        return JsonResponse(context)
    user = User.objects.filter(id=request.user.id)
    if user:
        return render(request, 'web/forgot_password.html', context)
    return render(request, 'web/forgot_password.html', context)


def resend_code(request, token):
    code, email = decrypt_token(token)
    token = generate_email(email)
    return JsonResponse({'token':token})


def verify_code(request, token):
    msg = None
    success = False
    context = {}
    if request.method == "POST":
        request_data = json.loads(request.body.decode('utf-8'))
        code = request_data.get('code')
        user = User.objects.filter(token=request_data.get('token')).first()
        if user is None:
            msg = "User not found"
        elif code != user.code:
            msg = "Verification code is invalid"
        else:
            success = True
        
        context['msg'] = msg
        context['success'] = success
        context['token'] = request_data.get('token')

        return JsonResponse(context)

    return render(request, 'web/verify_code.html', context)


def verify_codes(request):
    
    if request.method == "POST":
        request_data = json.loads(request.body.decode('utf-8'))
        code = request_data.get('code')
        token = request.POST['token']
        otp = OTP.objects.filter(token=token, type='forgot').order_by('-pk').first()
        if otp.code == code:
            return render(request, 'web/verify_code.html', context={"token": otp.verification_token})
    return render(request, 'web/verify_code.html')


def reset_password(request, pk):
    msg = None
    success = False
    context = {}

    if request.method == "POST":
        request_data = json.loads(request.body.decode('utf-8'))

        user = User.objects.filter(token=request_data.get('token')).first()

        if user:
            try:
                user.set_password(request_data.get('newpassword'))
                user.save()
                msg = "Password changed successfully!"
                success = True
            except Exception as e:
                print(e)
        
        context['msg'] = msg
        context['success'] = success
        return JsonResponse(context)
    return render(request, 'web/reset_password.html', context)


def Logout(request):
    logout(request)
    return redirect('signin')