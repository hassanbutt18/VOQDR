from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from .models import *
from rest_framework import serializers
from users.models import *


class OTPGenerationSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(required=True)
    type = serializers.CharField(required=True)
    role = serializers.CharField(required=True)
    email = serializers.CharField(required=False)

    class Meta:
        model = OTP
        fields = ['phone_number', 'type', 'role', 'email']

    def validate_type(self, type):
        type = type.lower()
        if type not in [Otp_types.create, Otp_types.forgot, Otp_types.changenumber]:
            raise ValidationError("Enter the correct type")
        return type

    def validate_phone_number(self, phone_number):
        if len(phone_number) < 10:
            raise ValidationError("Enter correct phone Number with atleast 10 digits")
        if len(phone_number) > 30:
            raise ValidationError("Enter the correct phone number with maximum number upto 30")
        return phone_number


class OTPForgotpasswordSerializer(serializers.Serializer):
    token = serializers.CharField(required=True, write_only=True)
    password = serializers.CharField(max_length=255, allow_blank=False)
    phone_number = serializers.CharField(required=True)

    class Meta:
        fields = ['phone_number', 'password']

    def validate_password(self, password):
        if password is None:
            raise ValidationError("Enter the 8 digit password again")
        if len(password) < 8:
            raise ValidationError("Enter the 8 digit password again")
        return password

    def update(self, instance, validated_data):
        password = validated_data.get('password')
        for inst in instance:
            inst.set_password(password)
            inst.save()
        return instance


class OTPGenerationForgotSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField()

    # otp_type = serializers.CharField()

    class Meta:
        model = OTP
        fields = ['phone_number']


class Otp_VerificationsSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(required=True)
    code = serializers.CharField(required=True)
    type = serializers.CharField(required=True)
    role = serializers.CharField(required=True)

    class Meta:
        model = OTP
        fields = ['phone_number', 'code', 'type','role']

    def validate_phone_number(self, phone_number):
        if len(phone_number) < 10:
            raise ValidationError("Enter correct phone Number with at least 10 digits")
        if len(phone_number) > 30:
            raise ValidationError("Enter the correct phone number with maximum number upto 30")
        return phone_number

    def validate_type(self, type):
        type = type.lower()
        if type not in [Otp_types.create, Otp_types.forgot, Otp_types.changenumber]:
            raise ValidationError("Enter the correct type")
        return type


class OTPGenerationNewNumberSerializer(serializers.Serializer):
    new_phone_number = serializers.CharField(required=True)
    type = serializers.CharField(required=True)

    class Meta:
        fields = ['phone_number', 'type']

    def validate_type(self, type):
        type = type.lower()
        if type not in [Otp_types.changenumber]:
            raise ValidationError("Enter the correct type")
        return type

    def validate_phone_number(self, phone_number):
        if len(phone_number) < 10:
            raise ValidationError("Enter correct phone Number with at least 10 digits")
        if len(phone_number) > 30:
            raise ValidationError("Enter the correct phone number with maximum number upto 30")
        return phone_number


class OTPVerifyNewNumberSerializer(serializers.Serializer):
    phone_number = serializers.CharField(required=True)
    code = serializers.CharField(required=True)

    class Meta:
        fields = ['phone_number', 'code']

    def validate_code(self, code):
        if len(code) > 4:
            raise ValidationError("Enter maximum 4 digit code")
        return code

    def validate_phone_number(self, phone_number):
        if len(phone_number) < 10:
            raise ValidationError("Enter correct phone Number with at least 10 digits")
        if len(phone_number) > 30:
            raise ValidationError("Enter the correct phone number with maximum number upto 30")
        return phone_number


class UpdatePasswordSerializer(serializers.Serializer):
    phone_number = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    role = serializers.CharField(required=True)

    class Meta:
        fields = ('phone_number', 'verification_token', 'password')

    def update(self, instance, validated_data):
        password = validated_data.get('password')
        for inst in instance:
            inst.set_password(password)
            inst.save()
        return instance


class UpdatePhoneNumberSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    phone_number =serializers.CharField(required=True)
    role = serializers.CharField(required=False)

    class Meta:
        fields = ('phone_number', 'verification_token', 'password','role')


    def update(self, instance, validated_data):
        print("************")
        return instance