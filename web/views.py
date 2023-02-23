import json
import stripe
import requests

from random import randint
from django.db.models import Q

from django.core.mail import send_mail
from django.shortcuts import render, redirect
from django.template import loader
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from voqdr.emailManager import EmailManager
from voqdr.helpers import *
from django.utils.crypto import get_random_string
from authentications.models import OTP
from authentications.services import *
from users.models import InvitedOrganization, LinkDevice, OrganizationPermissions, SharedOrganization, User, UserRoles, organization_permissions
from django.contrib.auth.decorators import login_required

from web.models import Application, Home, PrivacyPolicy, ProductFeature, TermsAndConditions, Testimonial, ApplicationImage, ContactUs
import tracemalloc

tracemalloc.start()


def otp_number():
    return str(randint(1000, 9999))


def get_auth_token(request):
    context = {}
    context['token'] = settings.AUTH_TOKEN
    return JsonResponse(context)


def index(request):
    context = {}
    main_descriptions = Home.objects.all()
    product_features = ProductFeature.objects.all()
    applications = Application.objects.all()
    application_image = ApplicationImage.objects.all()
    testimonials = Testimonial.objects.all()
    context['main_descriptions'] = main_descriptions
    context['product_features'] = product_features
    context['applications'] = applications
    context['application_image'] = application_image
    context['testimonials'] = testimonials
    return render(request, 'web/index.html', context)
import asyncio

@login_required(login_url='/signin/')
def maps_vodcur(request):
    msg = None 
    success = False
    user = request.user
    context={'nbar':'map'}
    context['active_org'] = user.id
    header = {"Authorization": f"Bearer {settings.AUTH_TOKEN}"}
    status, response = requestAPI('GET', 'https://api.nrfcloud.com/v1/devices?includeState=true', header,{})
    for devices in response['items']:
        try:
            list_devices = devices['state']['reported']['device']['deviceInfo']['batteryVoltage']
            if list_devices:
                battery_device = LinkDevice.objects.filter(device_id=devices['id']).first()
                if battery_device:
                    battery_device.battery_voltage = devices['state']['reported']['device']['deviceInfo']['batteryVoltage'] / 1000
                    battery_device.save(update_fields=['battery_voltage'])
                else:
                    pass  
        except Exception as e:
            pass
    context["shared_with_us_organizations"] = user.shared_with_organization.all()
    context['role'] = 'admin'
    linked_devices = LinkDevice.objects.filter(organization=user.id).values()
    multipleLocations = []
    devices_ids = []
    if linked_devices:
        linked_devices = ValuesQuerySetToDict(linked_devices)
        context['linked_devices'] = linked_devices
        devices_ids = [obj["device_id"] for obj in linked_devices]
        # if devices_ids:
        #     for device in devices_ids:
        #         url = F"https://api.nrfcloud.com/v1/location/history?deviceId={device}"
        #         response = asyncio.run(asyncRequestAPI(url, settings.AUTH_TOKEN))
        #         if response["items"]:
        #             multipleLocations.append(response["items"][0])
        msg= "Got devices successfully"
        success = True
    else:
        msg = "No devies found in your organization"
        success = False
    context['auth_token'] = json.dumps(settings.AUTH_TOKEN)
    context['devices_ids'] = json.dumps(devices_ids)
    context["multipleLocations"] = json.dumps(multipleLocations)
    context['msg'] = msg
    context['success'] = success
    return render(request, 'web/maps.html', context)


def get_shared_with_devices(request, pk):
    msg = None
    success = False
    context = {}
    devices = {}
    org = OrganizationPermissions.objects.filter(shared_by_id=pk, shared_to_id=request.user.id).first()
    linked_devices = None
    try:
        linked_devices = LinkDevice.objects.filter(organization_id=int(pk)).values()
        linked_devices = ValuesQuerySetToDict(linked_devices)
        if request.user.id == int(pk):
            devices['role'] = 'admin'
        else:
            devices['role'] = org.role
        devices['linked_devices'] = linked_devices
        text_template = loader.get_template('web/ajax/devices.html')
        html = text_template.render(devices)
        context["html"] = html
        msg = "Got Devices successfully"
        success = True 
    except Exception as e:
        text_template = loader.get_template('web/ajax/devices.html')
        html = text_template.render({'linked_devices':devices})
        context["html"] = html
        msg = "No device available in this organization"
        success = False
    context['msg'] = msg
    context['success'] = success
    return JsonResponse(context)


def refresh_devices(request, pk):
    context = {}
    devices = {}
    msg = None
    success = False
    linked_devices = None
    org = OrganizationPermissions.objects.filter(shared_by_id=pk, shared_to_id=request.user.id).first()
    try:
        linked_devices = LinkDevice.objects.filter(organization=pk).values()
        linked_devices = ValuesQuerySetToDict(linked_devices)
        if request.user.id == pk:
            devices['role'] = 'admin'
        else:
            devices['role'] = org.role
        devices['linked_devices'] = linked_devices
        text_template = loader.get_template('web/ajax/devices.html')
        html = text_template.render(devices)
        context["html"] = html
        msg = "Got Devices successfully from refresh"
        success = True
    except Exception as e:
        text_template = loader.get_template('web/ajax/devices.html')
        html = text_template.render({'linked_devices':devices})
        context["html"] = html
        msg = "No device available in this organization"
        success = False
    context['msg'] = msg
    context['success'] = success
    return JsonResponse(context)


def search_devices(request, pk):
    msg = None
    success = False
    context = {}
    devices = {}
    request_data = json.loads(request.body.decode('utf-8'))
    linked_devices = None
    org = OrganizationPermissions.objects.filter(shared_by_id=pk, shared_to_id=request.user.id).first()
    try:
        linked_devices = LinkDevice.objects.filter(Q(name__icontains=request_data.get('device')) | Q(description__icontains=request_data.get('device')), organization_id=pk).values()
        linked_devices = ValuesQuerySetToDict(linked_devices)
        if len(linked_devices) == 0:
            msg = "No such device found"
        else:
            success = True
            msg = "Searched successfully"
        if request.user.id == pk:
            devices['role'] = 'admin'
        else:
            devices['role'] = org.role
        devices['linked_devices'] = linked_devices
        text_template = loader.get_template('web/ajax/devices.html')
        html = text_template.render(devices)
        context["html"] = html
    except Exception as e:
        print(e)
    context['msg'] = msg
    context['success'] = success
    return JsonResponse(context)


def edit_device_name(request, pk):
    msg = None
    success = False
    context = {}
    request_data = json.loads(request.body.decode('utf-8'))
    linked_devices = LinkDevice.objects.filter(device_id=pk).first()
    org = OrganizationPermissions.objects.filter(shared_by_id=linked_devices.organization_id, shared_to_id=request.user.id).first()
    try:
        if request.user.id == linked_devices.organization_id:
            linked_devices.name = request_data.get('name')
            linked_devices.save(update_fields=['name'])
            msg = 'Device name changed successfully'
            success = True
        elif org is not None and org.role == 'admin':
            linked_devices.name = request_data.get('name')
            linked_devices.save(update_fields=['name'])
            msg = 'Device name changed successfully'
            success = True
        else:
            msg = "Permission Denied"
    except Exception as e:
        print(e)
        msg = "Either device no longer exists or you do not have permission to edit this device"
    context['msg'] = msg
    context['success'] = success
    return JsonResponse(context)


def edit_device_description(request, pk):
    msg = None
    success = False
    context = {}
    request_data = json.loads(request.body.decode('utf-8'))
    linked_devices = LinkDevice.objects.filter(device_id=pk).first()
    org = OrganizationPermissions.objects.filter(shared_by_id=linked_devices.organization_id, shared_to_id=request.user.id).first()
    try:
        if request.user.id == linked_devices.organization_id:
            linked_devices.name = request_data.get('name')
            linked_devices.description = request_data.get('description')
            linked_devices.save(update_fields=['name', 'description'])
            msg = 'Device has been updated successfully'
            success = True
        elif org is not None and org.role == 'admin':
            linked_devices.name = request_data.get('name')
            linked_devices.description = request_data.get('description')
            linked_devices.save(update_fields=['name', 'description'])
            msg = 'Device has been updated successfully'
            success = True
        else:
            msg = "Permission Denied"
    except Exception as e:
        print(e)
        msg = "Either device no longer exists or you do not have permission to edit this device"
    context['msg'] = msg
    context['success'] = success
    return JsonResponse(context)


def delete_device(request, pk):
    msg = None
    success= False
    context = {}
    linked_devices = LinkDevice.objects.filter(device_id=pk).first()
    org = OrganizationPermissions.objects.filter(shared_by_id=linked_devices.organization_id, shared_to_id=request.user.id).first()
    try:
        if request.user.id == linked_devices.organization_id:
            linked_devices.delete()
            msg = "Device deleted successfully"
            success = True
        elif org is not None and org.role == 'admin':
            linked_devices.delete()
            msg = "Device deleted successfully"
            success = True
        else:
            msg = "Permission Denied"
    except Exception as e:
        print(e)
        msg = "Either device no longer exists or you do not have permission to edit this device"
    context['msg'] = msg
    context['success'] = success
    return JsonResponse(context)


# def save_device_order(request, pk1, pk2):
#     msg = None
#     success = False
#     context = {}
#     try:
#         device1 = LinkDevice.objects.filter(device_order_id=pk1).first()
#         device2 = LinkDevice.objects.filter(device_order_id=pk2).first()
#         temp = device1.device_order_id
#         device1.device_order_id = device2.device_order_id
#         device2.device_order_id = temp
#         device1.save(update_fields=['device_order_id'])
#         device2.save(update_fields=['device_order_id'])
#         response = refresh_devices(request=request, pk=device1.organization_id)
#         context = json.loads(response.content)
#         msg = "Device order changed successfully"
#         success = True
#     except Exception as e:
#         print(e)
#     context['msg'] = msg
#     context['success'] = success
#     return JsonResponse(context)

def terms_and_conditions(request):
    context = {}
    terms_and_conditions = TermsAndConditions.objects.all().values()
    terms_and_conditions = ValuesQuerySetToDict(terms_and_conditions)
    context['terms_and_conditions'] = terms_and_conditions
    return render(request, 'web/terms-and-conditions.html', context)

def privacy_policy(request):
    context = {}
    privacy_policy = PrivacyPolicy.objects.all().values()
    privacy_policy = ValuesQuerySetToDict(privacy_policy)
    context['privacy_policy'] = privacy_policy
    return render(request, 'web/privacy-policy.html', context)


@login_required(login_url='/signin/')
def my_account(request):
    msg = None
    success = False
    context = {}
    user = request.user
    context["shared_with_us_organizations"] = user.shared_with_organization.all()
    context['shared_to_organizations'] = user.shared_from_organization.all()
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


def signin(request):
    msg = None
    success = False
    context = {}
    if request.user.is_authenticated:
        return redirect('/map/')
    if request.method == "POST":
        request_data = request.body.decode('utf-8')
        request_data = json.loads(request_data)
        try:
            user = User.objects.get(email__iexact=request_data.get('email'))
        except Exception as e:
            user = None
        if user is None:
            msg = 'You are not registered, signup first'
        elif not user.check_password(request_data.get('password')):
            msg = 'Incorrect password, try again'
        elif not user.is_active:
            msg = 'You are suspended by VOQDR'
        else:
            login(request, user)
            success = True
        context["msg"] = msg
        context["success"] = success
        return JsonResponse(context)
    return render(request, 'web/signin.html')


def check_signin(request):
    msg = 'Please signin first'
    success = False
    context = {}
    if request.user.is_authenticated:
        msg = "User is signedin"
        success = True
    context['msg'] = msg
    context['success'] = success
    return JsonResponse(context)


def Logout(request):
    logout(request)
    return redirect('signin')


def signup(request):
    msg = None
    success = False
    context = {}
    if request.method == "POST":
        request_data = json.loads(request.body.decode('utf-8'))
        if User.objects.filter(email=request_data.get('email')).exists():
            msg = "You already exist, continue to sign in."
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

def invite_organization(request):
    msg = "Email was not sent"
    success = False
    context = {}
    user = request.user
    if request.method == "POST":
        request_data = json.loads(request.body.decode('utf-8'))
        if user.email != request_data['email']:
            token = get_dict_token({'shared_by':user.id,'shared_to':request_data['email'], 'role':request_data['role']})
            random_password = get_random_string(length=8)
            search_invited_user = User.objects.filter(email=request_data['email'], is_organization=False)
            if User.objects.filter(email=request_data['email'], is_organization=True):
                msg = "You can not invite to an organization"
            elif search_invited_user and OrganizationPermissions.objects.filter(shared_to=search_invited_user.first()):
                msg = "This email is already associated to another email."
            else:
                try:
                    share_to = User.objects.get(email=request_data['email'])
                    if not share_to.is_organization:
                        share_to.set_password(random_password)
                        share_to.save()
                except User.DoesNotExist:
                    share_to = User.objects.create_user(email=request_data['email'], organization=request_data['email'].split('@')[0], password=random_password, is_organization=False)
                org = OrganizationPermissions.objects.filter(shared_by=user, shared_to=share_to).first()
                # if InvitedOrganization.objects.filter(shared_by=user, shared_to=request_data['email']).first():
                #     msg = "You already invited this user before"
                if org:
                    msg = "Organization already shared"
                else:
                    try:
                        invited = InvitedOrganization.objects.get(shared_by=user, shared_to=request_data['email'], role=request_data['role'])
                    except InvitedOrganization.DoesNotExist:
                        invited = InvitedOrganization.objects.create(shared_by=user, shared_to=request_data['email'], role=request_data['role'])
                    try:
                        status = EmailManager.send_email_invite(request_data['email'], request_data['role'], user.organization, token, request, random_password=random_password)
                        msg = 'Invitation sent successfully'
                        success = True
                    except Exception as e:
                        print(e)
        else:
            msg = "You cannot invite yourself"
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
    share_by = User.objects.filter(id=data['shared_by']).first()
    if not InvitedOrganization.objects.filter(shared_to=data['shared_to'], shared_by_id=data['shared_by']):
        return HttpResponse("Organization invitation expired.")
    if status:
        if User.objects.filter(email=data['shared_to']):
            org = SharedOrganization.objects.create(shared_to=data['shared_to'], shared_by_id=data['shared_by'], role=data['role'], is_verified=True)
        else:
            org = SharedOrganization.objects.create(shared_to=data['shared_to'], shared_by_id=data['shared_by'], role=data['role'])
        invitation = InvitedOrganization.objects.filter(shared_to=data['shared_to'], shared_by_id=data['shared_by'])
        if invitation:
            invitation.delete()
    else:
        invitation = InvitedOrganization.objects.filter(shared_to=data['shared_to'], shared_by_id=data['shared_by'])
        if invitation:
            invitation.delete()
    try:
        EmailManager.send_approval_status_email(share_by.email, data['shared_to'], status, data['role'])
    except Exception as e:
        print(e)
    return redirect('/')


def get_organization_details(request, pk):
    msg = None
    success = False
    context = {}
    if request.user.id == int(pk):
        permissions = User.objects.get(pk=pk)
        context['organization'] = permissions.organization
        context['address'] = permissions.address
        context['role'] = 'admin'
    else:
        user = request.user
        permissions = OrganizationPermissions.objects.filter(shared_by=pk, shared_to_id=user).first()
        context['organization'] = permissions.shared_by.organization
        context['address'] = permissions.shared_by.address
        context['role'] = permissions.role        
    return JsonResponse(context)


def edit_organization_details(request, pk):
    msg = "Permission Denied"
    success = False
    context = {}
    request_data = json.loads(request.body.decode('utf-8'))
    user = request.user
    if user.id == int(pk):
        try:
            organization = User.objects.get(pk=pk)
            if organization:
                organization.organization = request_data.get('organization')
                organization.address = request_data.get('address')
                organization.save(update_fields=["organization", "address"])
                success = True
        except Exception as e:
            print(e)
    else:
        try:
            permissions = OrganizationPermissions.objects.get(shared_by=pk, shared_to_id=user)
            if permissions.role == UserRoles.ADMIN:
                organization = User.objects.get(pk=pk)
                if organization:
                    organization.organization = request_data.get('organization')
                    organization.address = request_data.get('address')
                    organization.save(update_fields=["organization", "address"])
                    success = True
        except Exception as e:
            print(e)
            msg = "Permission denied"
    context['msg'] = msg
    context['success'] = success
    return JsonResponse(context)


def edit_organization_role(request, pk):
    msg = None
    success = False
    context = {}
    request_data = json.loads(request.body.decode('utf-8'))
    try:
        user = User.objects.get(id=pk)
        if user:
            shared_org = SharedOrganization.objects.filter(shared_by=request.user, shared_to=user.email).first()
            if shared_org:
                shared_org.role = request_data.get('role')
                shared_org.save(update_fields=['role'])
                msg = "Organization role updated"
                success = True
    except Exception as e:
        print(e) 
    context['msg'] = msg
    context['success'] = success
    return JsonResponse(context)


def remove_shared_organization(request, pk):
    msg = None
    success = False
    context = {}
    try:
        user = User.objects.get(id=pk)
        if user:
            shared_org = SharedOrganization.objects.filter(shared_by=request.user, shared_to=user.email)
            if shared_org:
                shared_org.delete()
            org = OrganizationPermissions.objects.filter(shared_by=request.user, shared_to=user)
            if org:
                org.delete()
            user_in_org = User.objects.filter(id=pk, is_organization=False)
            if user_in_org:
                user_in_org.delete()
        success = True
        
    except Exception as e:
        org = None
    context['msg'] = msg
    context['success'] = success
    return JsonResponse(context)


def contact_us(request):
    msg = None
    success = False
    context = {}    
    request_data = json.loads(request.body.decode('utf-8'))
    try:
        EmailManager.send_contact_us_email(request_data.get('name'), request_data.get('email'), request_data.get('message'))
        ContactUs.objects.create(name=request_data.get('name'), email=request_data.get('email'), message=request_data.get('message'))
        msg = "Email sent successfully!"
        success = True
    except Exception as e:
        print(e)
    context['msg'] = msg
    context['success'] = success
    return JsonResponse(context)


@csrf_exempt
def stripe_config(request):
    context = {}
    if request.method == 'GET':
        context['publicKey'] = settings.STRIPE_PUBLIC_KEY
        return JsonResponse(context)


def product_checkout(request, qty):
    context={}
    stripe.api_key = settings.STRIPE_SECRET_KEY
    try:
        checkout_session = stripe.checkout.Session.create(
            client_reference_id=request.user.id if request.user.is_authenticated else None,
            customer_email=request.user.email,
            line_items=[{
                'price': f'{settings.PRICE_ID}',
                'quantity': qty
            }],
            mode='payment',
            success_url = settings.BASE_URL + 'successful-checkout',  
            cancel_url = settings.BASE_URL,
        )
        context['checkout_session_id'] = checkout_session['id']
        return JsonResponse(context)
    except Exception as e:
        return HttpResponse(str(e))


@csrf_exempt
def webhook_received(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    endpoint_secret = settings.STRIPE_ENDPOINT_SECRET
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    event = None
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return HttpResponse(status=400)
    if event['type'] == 'checkout.session.completed':
        print("Payment was successful.")
        session = event['data']['object']
        client_reference_id = session.get('client_reference_id')
        customer_email = session.get('customer_email')

    return HttpResponse(status=200)


@login_required(login_url='/signin/')
def successful_checkout(request):
    return render(request, 'web/successful_checkout.html')