from datetime import timedelta
from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.throttling import UserRateThrottle

from StocksMaze.sanitizer import cleaning_data_for_html
from .serializers import OTPGenerationSerializer, Otp_VerificationsSerializer, OTPForgotpasswordSerializer, \
    OTPGenerationForgotSerializer, OTPGenerationNewNumberSerializer, OTPVerifyNewNumberSerializer, \
    UpdatePasswordSerializer, UpdatePhoneNumberSerializer
from .services import *
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework import viewsets, status
from users.models import User
from authentications.permission import *
from StocksMaze.twilio import MessagesService
from StocksMaze.throttling import OtpThrottle
from django.utils.html import strip_tags
# Create your views here.


class OtpGenerateViewSet(viewsets.ModelViewSet):
    http_method_names = ['post']
    throttle_classes = [OtpThrottle]

    def create(self, request, *args, **kwargs):
        serializer = OTPGenerationSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            phone_number = serializer.validated_data['phone_number']
            type = serializer.validated_data['type']
            role = serializer.validated_data['role']
            email = serializer.validated_data.get('email', None)
            role = role.lower()
            cleaning_data_for_html(type=type, role=role, email=email)
            if role not in ['buyer', 'business']:
                raise ValidationError({"msg": "Enter the correct role to continue"})
            user = User.objects.filter(phone_number=phone_number, role=role)
            if type == Otp_types.create:
                if not user.exists():
                    print("That is my email", email)
                    print("That is my role", role)
                    print("I am going to print here", email is not None)
                    if email is not None:
                        print("***************************My Email**********************************", email)
                        user = User.objects.filter(email=email, role=role)
                        print("That is my user", user)
                        if not user:
                            secret_key = otp_number()
                            # res = MessagesService.send_message(phone_number, code=secret_key)
                            # if res.get('status') == 200:
                            verification_token = get_otp_verified_token(phone_number=phone_number)
                            timeout = timezone.now() + timedelta(seconds=settings.OTP_TIMEOUT_SECONDS)
                            otp = OTP.objects.create(phone_number=phone_number, code=secret_key,
                                                     verification_token=verification_token, timeout=timeout, type=type,
                                                     role=role)
                            print("This is my otp code", otp.code)
                            # return Response({'msg': res.get('msg')},status=status.HTTP_201_CREATED)
                            return Response({'msg': "Message have been sent"}, status=status.HTTP_201_CREATED)
                            # else:
                            #     # return Response({'msg': "Message is not send "}, status=status.HTTP_201_CREATED)
                            #     return Response({'msg': res.get('msg')}, status=status.HTTP_400_BAD_REQUEST)
                        else:
                            return Response({"msg": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
                    secret_key = otp_number()
                    # res = MessagesService.send_message(phone_number, code=secret_key)
                    # if res.get('status') == 200:
                    verification_token = get_otp_verified_token(phone_number=phone_number)
                    timeout = timezone.now() + timedelta(seconds=settings.OTP_TIMEOUT_SECONDS)
                    otp = OTP.objects.create(phone_number=phone_number, code=secret_key,
                                             verification_token=verification_token, timeout=timeout, type=type,
                                             role=role)
                    print("This is my otp code", otp.code)
                    return Response({'msg': "Message have been sent"}, status=status.HTTP_201_CREATED)
                    # return Response({'msg': res.get('msg')}, status=status.HTTP_201_CREATED)
                    # else:
                    # return Response({'msg': res.get('msg')}, status=status.HTTP_400_BAD_REQUEST)
                    # return Response({'msg': 'Unable to send the message'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response(
                        {'msg': 'Continue to signin you are already registered as {role}'.format(role=role)},
                        status=status.HTTP_409_CONFLICT)
            elif type == Otp_types.forgot:
                role = serializer.validated_data['role']
                role = role.lower()
                if role not in ['buyer', 'business']:
                    raise ValidationError({"msg": "Enter the correct role to continue"})
                condition = User.objects.filter(phone_number=phone_number, role=role).exists()
                if condition:
                    secret_key = otp_number()
                    verification_token = get_otp_verified_token(phone_number=phone_number)
                    timeout = timezone.now() + timedelta(seconds=settings.OTP_TIMEOUT_SECONDS)
                    otp = OTP.objects.create(phone_number=phone_number, code=secret_key,
                                             verification_token=verification_token,
                                             timeout=timeout, type=type, role=role)
                    print("That is my otp code", otp.code)
                    return Response({"msg": "Message Sent"}, status=status.HTTP_201_CREATED)
                    # res = MessagesService.send_message(phone_number, code=otp.code)
                    # if res.get('status') == 200:
                    #     return Response({"msg": res.get('msg')}, status=status.HTTP_201_CREATED)
                    # else:
                    #     return Response({'msg': res.get('msg')}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"msg": "The user doesn't exist register first"},
                                    status=status.HTTP_404_NOT_FOUND)
            elif type == Otp_types.changenumber:
                role = serializer.validated_data['role']
                role = role.lower()
                if role not in ['buyer', 'business']:
                    raise ValidationError({"msg": "Enter the correct role to continue"})
                if User.objects.filter(phone_number=phone_number, role=role).exists():
                    return Response({"msg": "User with this phone number already exists"},
                                    status=status.HTTP_400_BAD_REQUEST)
                else:
                    role = serializer.validated_data['role']
                    secret_key = otp_number()
                    print("That is my secret key", secret_key)
                    verification_token = get_otp_verified_token(phone_number=phone_number)
                    timeout = timezone.now() + timedelta(seconds=settings.OTP_TIMEOUT_SECONDS)
                    otp = OTP.objects.create(phone_number=phone_number, code=secret_key, type=type,
                                             verification_token=verification_token,
                                             timeout=timeout, role=role)
                    # res = MessagesService.send_message(phone_number, code=secret_key)
                    # res =True
                    # if res:
                    return Response({"msg": "Message sent"}, status=status.HTTP_201_CREATED)
                    # return Response({'msg': res.get('msg')}, status=status.HTTP_201_CREATED)
                    # else:
                    # return Response({'msg': res.get('msg')}, status=status.HTTP_400_BAD_REQUEST)
                    # return Response({'msg': "Unable to send the message"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"msg": "Enter correct type to continue"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'], permission_classes=[StoreUser])
    def update_phone_number(self, request, *args, **kwargs):
        serializer = OTPGenerationNewNumberSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            updated_phone_number = serializer.validated_data['new_phone_number']
            if User.objects.filter(phone_number=updated_phone_number).exists():
                return Response({"msg": "User with this phone number already exists"},
                                status=status.HTTP_400_BAD_REQUEST)
            else:
                # login_user = request.user.phone_number
                # update_status = User.objects.filter(phone_number=login_user).update(phone_number=updated_phone_number)
                # if update_status:
                secret_key = otp_number()
                verification_token = get_otp_verified_token(phone_number=updated_phone_number)
                timeout = timezone.now() + timedelta(seconds=settings.OTP_TIMEOUT_SECONDS)
                otp = OTP.objects.create(phone_number=updated_phone_number, code=secret_key,
                                         verification_token=verification_token,
                                         timeout=timeout)
                return Response({'msg': "Message Sent"}, status=status.HTTP_201_CREATED)
                # res = MessagesService.send_message(updated_phone_number, code=otp.code)
                # if res:
                #     return Response({'msg': res.get('msg')}, status=status.HTTP_201_CREATED)
                # else:
                #     return Response({'msg': res.get('msg')}, status=status.HTTP_400_BAD_REQUEST)
            # else:
            #     return Response({"msg": "Unable to update the phone number"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"msg": "Unable to update the phone number"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'], permission_classes=[StoreUser])
    def update_verify_phone_number(self, request, *args, **kwargs):
        serializer = OTPVerifyNewNumberSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            phone_number = serializer.validated_data['phone_number']
            code = serializer.validated_data['code']
            otp = OTP.objects.filter(phone_number=phone_number).order_by('-pk').first()
            codes = int(code)
            if otp:
                if otp.code != codes:
                    return Response({'msg': 'Invalid or expired otp.'},
                                    status=status.HTTP_400_BAD_REQUEST)
                elif not otp:
                    return Response({'msg': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
                if timezone.now() > otp.timeout:
                    return Response({'msg': 'Invalid or expired otp'},
                                    status=status.HTTP_408_REQUEST_TIMEOUT)
                elif otp.code == codes:
                    # otp.save()
                    # login_user = request.user.phone_number
                    # update_status = User.objects.filter(phone_number=login_user).update(phone_number=phone_number)
                    # if update_status:
                    return Response(
                        {'msg': 'This is your verification code', 'data': otp.verification_token},
                        status=status.HTTP_200_OK)
                else:
                    return Response({"msg": "Enter correct data"},

                                    status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"msg": "Enter correct phone number"},
                                status=status.HTTP_401_UNAUTHORIZED)


class OtpVerificationViewSet(viewsets.ModelViewSet):
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = Otp_VerificationsSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            phone_number = serializer.validated_data['phone_number']
            code = serializer.validated_data['code']
            type = serializer.validated_data['type']
            role = serializer.validated_data['role']
            role = role.lower()
            cleaning_data_for_html(type=type, role=role, code=code)
            if role not in ['buyer', 'business']:
                raise ValidationError({"msg": "Enter the correct role to continue"})
            user = User.objects.filter(phone_number=phone_number, role=role).exists()
            if user:
                if type == Otp_types.forgot:
                    otp = OTP.objects.filter(phone_number=phone_number, type=type, role=role).order_by('-pk').first()
                    codes = int(code)
                    if otp:
                        if otp.code != codes:
                            return Response({'msg': 'Invalid or expired otp.'},
                                            status=status.HTTP_400_BAD_REQUEST)
                        elif not otp:
                            return Response({'msg': 'Record not found enter the correct role'},
                                            status=status.HTTP_404_NOT_FOUND)
                        if timezone.now() > otp.timeout:
                            return Response({'msg': 'Your token expires'}, status=status.HTTP_408_REQUEST_TIMEOUT)
                        elif otp.code == codes:
                            otp.save()
                            return Response(
                                {'msg': 'This is your verification code', 'data': otp.verification_token},
                                status=status.HTTP_200_OK)
                    else:
                        return Response({"msg": "Enter correct data"},status=status.HTTP_403_FORBIDDEN)
            if type == Otp_types.create:
                otp = OTP.objects.filter(phone_number=phone_number, type=type, role=role).order_by('-pk').first()
                codes = int(code)
                if otp:
                    if otp.code != codes:
                        return Response({'msg': 'Invalid or expired otp.'},
                                        status=status.HTTP_400_BAD_REQUEST)
                    elif not otp:
                        return Response({'msg': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
                    if timezone.now() > otp.timeout:
                        return Response({'msg': 'Your token is expired'}, status=status.HTTP_401_UNAUTHORIZED)
                    elif otp.code == codes:
                        otp.save()
                        return Response({'msg': 'This is your verification code', 'data': otp.verification_token},
                                        status=status.HTTP_200_OK)
                else:
                    return Response({"msg": "Record not found"}, status=status.HTTP_403_FORBIDDEN)
            if type == Otp_types.changenumber:
                otp = OTP.objects.filter(phone_number=phone_number, type=type, role=role).order_by('-pk').first()
                print("This is my otp", otp)
                codes = int(code)
                if otp:
                    if otp.code != codes:
                        return Response({'msg': 'Invalid or expired otp.'},
                                        status=status.HTTP_400_BAD_REQUEST)
                    elif not otp:
                        return Response({'msg': 'Record not found enter the correct role'},
                                        status=status.HTTP_404_NOT_FOUND)
                    if timezone.now() > otp.timeout:
                        return Response({'msg': 'Your token expires'},
                                        status=status.HTTP_408_REQUEST_TIMEOUT)
                    elif otp.code == codes:
                        otp.save()
                        return Response(
                            {'msg': 'This is your verification code', 'data': otp.verification_token},
                            status=status.HTTP_200_OK)
                else:
                    return Response({"msg": "Enter correct data"},status=status.HTTP_403_FORBIDDEN)

            else:
                return Response({"msg": "Enter the correct type"}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({"msg": "Record not found"}, status=status.HTTP_404_NOT_FOUND)


class OtpForgotViewSet(viewsets.ModelViewSet):
    http_method_names = ['post']

    @action(detail=False, methods=['POST'])
    def forgot_password(self, request, *args, **kwargs):
        phone_number = request.data.get('phone_number')
        role = request.data.get('role')
        cleaning_data_for_html(role=role)
        instance = User.objects.filter(phone_number=phone_number, role=role)
        serializer = UpdatePasswordSerializer(instance=instance, data=request.data)
        if serializer.is_valid(raise_exception=True):
            phone_number = serializer.validated_data.get('phone_number', None)
            token = request.data.get('token')
            try:
                user = User.objects.get(phone_number=phone_number, role=role)
            except User.DoesNotExist as ex:
                return Response({"msg": "Password does not exist"})

            user_otp = OTP.objects.filter(phone_number=phone_number, verification_token=token, role=role).order_by(
                '-pk').first()
            print("User_otp", user_otp)

            if user_otp is None:
                return Response({"msg": "Token verification failed"}, status=status.HTTP_406_NOT_ACCEPTABLE)
            serializer.save()
            user_otp.delete()
            return Response({"msg": "Password changed successfully"}, status=status.HTTP_200_OK)


class OtpUpdateViewSet(viewsets.ModelViewSet):
    http_method_names = ['post']

    @action(detail=False, methods=['POST'], permission_classes=[StoreUser | BuyerUser])
    def update_phonenumber(self, request, *args, **kwargs):
        old_phone_number = request.user.phone_number
        print("This is my old_phone_number", old_phone_number)
        role = request.data.get('role')
        cleaning_data_for_html(role=role)
        print("this is my role", role)
        if not role:
            raise ValidationError({"msg": "Enter the role to proceed"})
        role = role.lower()
        if role not in ['buyer', 'business']:
            raise ValidationError({"msg": "Enter the correct role to continue"})
        instance = User.objects.filter(phone_number=old_phone_number, role=role)
        print("This is my instance", instance)
        if instance.exists():
            print("I was here")
            serializer = UpdatePhoneNumberSerializer(instance=instance, data=request.data)
            if serializer.is_valid(raise_exception=True):
                phone_number = request.data.get('phone_number')
                token = request.data.get('token')
                print("THis is my phone number", phone_number, token, role)
                request_data = request.data.copy()
                # request_data['profile'] = F"{user_id}{request_data['role']}.{request_data['phone_number']}@stocksmaze.com"
                # print("This is my request_data email", request_data['profile'])
                user_otp = OTP.objects.filter(phone_number=phone_number, verification_token=token, role=role).order_by(
                    '-pk').first()
                print("This is my user_otp", user_otp)
                if user_otp is None:
                    return Response({"msg": "Token verification failed"}, status=status.HTTP_404_NOT_FOUND)
                login_user = request.user.phone_number
                print("This is my login_user", login_user)
                user_id = User.objects.filter(phone_number=login_user, role=role).first().id
                request_data[
                    'profile'] = F"{user_id}{request_data['role']}.{request_data['phone_number']}@stocksmaze.com"
                update_status = User.objects.filter(phone_number=login_user, role=role).update(
                    phone_number=phone_number, profile=request_data['profile'])
                print("THis is my update_status", update_status)
                if update_status:
                    serializer.save()
                    user_otp.delete()
                    return Response({"msg": "Phone Number changed successfully"}, status=status.HTTP_200_OK)
                else:
                    return Response({"msg": "Unable to update the number"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            print("I am here")
            return Response({"msg": "Unable to update the record"}, status=status.HTTP_401_UNAUTHORIZED)
