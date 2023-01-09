import json
from random import randint

from django.core.mail import send_mail
from django.shortcuts import render, redirect
from django.template import loader
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from django.urls import reverse
from voqdr.emailManager import EmailManager
from voqdr.helpers import *

from authentications.models import OTP
from authentications.services import *
from users.models import InvitedOrganization, SharedOrganization, User
from voqdr.services import otp_number
from django.contrib.auth.decorators import login_required

from web.models import Application, ProductFeature, Testimonial




def otp_number():
    return str(randint(1000, 9999))



def index(request):
    context = {}
    product_features = ProductFeature.objects.all()[:3]
    applications = Application.objects.all()[:3]
    testimonials = Testimonial.objects.all()[:3]
    context['product_features'] = product_features
    context['applications'] = applications
    context['testimonials'] = testimonials
    return render(request, 'web/index.html', context)

@login_required(login_url='/signin/')
def maps_vodcur(request):
    context={'nbar':'map'}
    return render(request, 'web/maps.html', context)

@login_required(login_url='/signin/')
def my_account(request):
    msg = None
    success = False
    context = {}
    user = request.user
    shared_organizations_queryset = SharedOrganization.objects.filter(invite_by=user, is_verified=True)
    shared_org_emails = [obj.invite_to for obj in shared_organizations_queryset]
    context["shared_organizations"] = User.objects.filter(email__in=shared_org_emails)
    if request.method == 'POST':
        context = {}
        request_data = request.POST.copy()
        if 'image' in request.FILES:
            request_data["image"] = request.FILES['image']
        request_data = queryDict_to_dict(request_data)
        del request_data["csrfmiddlewaretoken"]
        user.name = request_data["name"]
        user.email = request_data["email"]
        if request_data["image"]:
            user.image = request_data["image"]
            user.save(update_fields=['name', 'email', 'image'])
        else:
            user.save(update_fields=['name', 'email'])
        msg = "Profile updated succesfully"
        success = True
        context['msg'] = msg
        context['success'] = success
        return JsonResponse(context)
    return render(request, 'web/account.html', context)


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


def invite_organization(request):
    msg = None
    success = False
    context = {}
    user = request.user
    if request.method == "POST":
        request_data = json.loads(request.body.decode('utf-8'))
        token = get_dict_token({'invite_by':user.id,'invite_to':request_data['email'], 'role':request_data['role']})
        try:
            org = InvitedOrganization.objects.get(invite_to=request_data['email'], invite_by=user)
            if org:
                org.role = request_data['role']
                org.save(update_fields=['role'])
        except Exception as e:
            invitation = InvitedOrganization.objects.create(invite_by=user, invite_to=request_data['email'],role=request_data['role'])
        try:
            EmailManager.send_email_invite(request_data['email'], request_data['role'], user.organization, token, request)
            msg = 'Invitation sent successfully'
            success = True
        except Exception as e:
            print(e)
        context['msg'] = msg
        context['success'] = success
        return JsonResponse(context)
    return render(request, 'web/account.html', context)


def invitation_approval(request, token, status):
    data = {}
    if status == '0':
        status = False
    else:
        status = True
    decrypt_token = decrypt_dict(token)
    del decrypt_token[-1]
    for i in decrypt_token:
        key, value = i.split('=')
        data[key] = value
    invited_by = User.objects.filter(id=data['invite_by']).first()    
    if status:
        try:
            org = SharedOrganization.objects.get(invite_to=data['invite_to'], invite_by_id=data['invite_by'])
            if org:
                org.role = data['role']
                org.is_verified = True
                org.save(update_fields=['role', 'is_verified'])
        except Exception as e:
            if User.objects.filter(email=data['invite_to']):
                org = SharedOrganization.objects.create(invite_to=data['invite_to'], invite_by_id=data['invite_by'], role=data['role'], is_verified=True)
            else:
                org = SharedOrganization.objects.create(invite_to=data['invite_to'], invite_by_id=data['invite_by'], role=data['role'])
        finally:
            invitation = InvitedOrganization.objects.filter(invite_to=data['invite_to'], invite_by_id=data['invite_by'])
            if invitation:
                invitation.delete()
    else:
        invitation = InvitedOrganization.objects.filter(invite_to=data['invite_to'], invite_by_id=data['invite_by'])
        if invitation:
            invitation.delete()
    try:
        EmailManager.send_approval_status_email(invited_by.email, data['invite_to'], status, data['role'])
    except Exception as e:
        print(e)
    return redirect('/')



def get_organization_details(request, pk):
    msg = None
    success = False
    context = {}
    try:
        organization = User.objects.get(pk=pk)
    except Exception as e:
        organization = None
    if organization:
        context['organization'] = organization.organization
        context['address'] = organization.address
    return JsonResponse(context)


def edit_organization_details(request, pk):
    msg = None
    success = False
    context = {}
    request_data = json.loads(request.body.decode('utf-8'))
    try:
        organization = User.objects.get(pk=pk)
        if organization:
            organization.organization = request_data.get('organization')
            organization.address = request_data.get('address')
            organization.save(update_fields=["organization", "address"])
            success = True
    except Exception as e:
        print(e)
    print(request_data)
    return JsonResponse(context)