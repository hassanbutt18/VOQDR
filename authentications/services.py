from .models import *
from random import randint
import base64
from django.utils import timezone
from datetime import datetime, timedelta

def otp_number():
    return str(randint(1000, 9999))
    # return str(9999)


def get_otp_verified_token(email):
    token_str = otp_number() + 'email=' + email
    token_str_bytes = token_str.encode('ascii')
    base64_bytes = base64.b64encode(token_str_bytes)
    base64_message = base64_bytes.decode('ascii')
    return base64_message

def generate_otp_token(email):
    otp = otp_number()
    token_str = otp + email + 'Time' + str(datetime.now().strftime("%m/%d/%Y %H:%M:%S"))
    token_str_bytes = token_str.encode('ascii')
    base64_bytes = base64.b64encode(token_str_bytes)
    base64_message = base64_bytes.decode('ascii')
    return base64_message, otp


def decrypt_token(token):
    token_str_bytes = token.encode('ascii')
    base64_bytes = base64.b64decode(token_str_bytes)
    base64_message = base64_bytes.decode('ascii')
    code, email = base64_message.split('email=')
    return code, email

