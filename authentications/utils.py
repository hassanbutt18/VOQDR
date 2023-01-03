from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    # if response is None:
    #     return Response({"msg": "Some thing went wrong we are working on it"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return response
