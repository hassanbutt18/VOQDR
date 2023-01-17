import base64
import json
import re
import requests
from django.http.response import JsonResponse
from django.core.mail import send_mail
from datetime import datetime
from django.conf import settings
from datetime import datetime, date, timedelta
import uuid
import os
from django.core import serializers

SUCCESS_CODE = 1

def requestAPI(method:str, url:str, headers:dict, data:dict):
    status = 400
    try:
        response = requests.request(method, url, headers=headers)
        return response.status_code, response.json()
    except Exception as e:
        return status, str(e)

def SuccessResponse(data):
    return JsonResult(SUCCESS_CODE, data, status.HTTP_200_OK)


def ErrorResponse(custom_obj, body=None):
    if body is None:
        return JsonResult(custom_obj.code, custom_obj.message, custom_obj.http_code)
    return JsonResult(custom_obj.code, body, custom_obj.http_code)


def numToBool(num):
    if num == 0 or num == '0':
        return False
    else:
        return True


def JsonResult(success_code, data, http_status_code):
    if success_code is not None and success_code != SUCCESS_CODE:
        return JsonResponse(data={
            "success": success_code,
            "errors": data
        }
            , status=http_status_code)
    else:
        if isinstance(data, str):
            return JsonResponse(data={
                "success": success_code,
                "message": data
            }
                , status=http_status_code)
        else:
            return JsonResponse(data={
                "success": success_code,
                "data": data
            }
                , status=http_status_code)


def get_file_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = "%s.%s" % (uuid.uuid4(), ext)
    # return os.path.join(settings.MEDIA_URL, filename)
    return filename


def send_email(to_address, subject, body):
    send_mail(
        subject=subject,
        message=body,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[to_address],
        fail_silently=False,
    )


months_name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def querysetToJson(qs):
    qs_json = serializers.serialize('json', qs)
    return qs_json


def queryDict_to_dict(qdict):
    return {k: v[0] if len(v) == 1 else v for k, v in qdict.lists()}


def get_json_dump(dictionary):
    return json.dumps(dictionary, indent=4)


def get_stringify_dict(dictionary):
    return json.loads(json.dumps(dictionary), parse_int=str)


def is_valid_str(token):
    if token is not None and token.strip() != '':
        return True
    return False


def pop_key(dictionary, key):
    try:
        return dictionary.pop(key)
    except KeyError:
        return None


def get_base_url(request):
    protocol = request.build_absolute_uri().split(request.get_host())[0]
    return F"{protocol}{request.get_host()}"


def sendOtpToMail(mail):
    subject = "StockMaze Verification"
    body = F"""Here's your StockMaze verification code 4556 to verify your phone number."""
    try:
        send_email(mail, subject, body)
    except Exception as e:
        print(e)
    return 3434


def convert_12hour_to_military_time(time_string):
    try:
        temp_date = datetime.strptime(time_string, '%I:%M %p')
        return str(temp_date.time())
    except Exception as ex:
        return time_string


def decode_bytes(input_bytes):
    return input_bytes.decode(settings.DEFAULT_FILE_ENCODING)


def remove_line_containing(substr: str, main_str: str):
    return re.sub(r'''[\w :]+''' + substr + '''\n''', '', main_str)


def getBoolean(attr):
    if attr.lower() == 'true' or attr == 1:
        return True
    return False



def get_dict_token(dict):
    token_str = ''
    for x, y in dict.items():
        token_str += F'{x}={y}___'
    token_str =token_str+str(datetime.now().strftime("%S"))
    token_str_bytes = token_str.encode('ascii')
    base64_bytes = base64.b64encode(token_str_bytes)
    base64_message = base64_bytes.decode('ascii')
    return base64_message


def decrypt_dict(token):
    token_str_bytes = token.encode('ascii')
    base64_bytes = base64.b64decode(token_str_bytes)
    base64_message = base64_bytes.decode('ascii')
    data = base64_message.split('___')
    return data