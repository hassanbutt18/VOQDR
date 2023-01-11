import os
from pydoc import Helper
from django.template.loader import get_template
from django.template import Context
from users.models import User
from voqdr import helpers
from django.conf import settings
from django.core.mail import EmailMultiAlternatives


class EmailManager:
  templates_base_path = 'email_templates'

  def __init__(self) -> None:
    pass

  @staticmethod
  def send_email_confirmation_notification(email: str, request=None):
    try:
      user = User.objects.get(email=email)
    except User.DoesNotExist:
      user = None
    BASE_URL = settings.BASE_URL
    if request:
      BASE_URL = helpers.get_base_url(request)
    LOGO = settings.LOGO
    if helpers.get_base_url(request) != settings.LOCAL_BASE_URL:
      LOGO = f"{helpers.get_base_url(request)}/static/assets/common/dist/img/logo.png"
    if user:
      try:
        email_subject = 'Email Verification.'    
        text_content = settings.PROJECT_NAME + email_subject
        text_template = get_template("email_templates/unverified-email.html")
        context_obj = {
            'BASE_URL':BASE_URL,
            'LOGO':LOGO,
            'project_name': settings.PROJECT_NAME,
            'user': user,
        }
        template_content = text_template.render(context_obj)
        msg = EmailMultiAlternatives(email_subject, text_content,settings.EMAIL_HOST_USER, [user.email])
        msg.attach_alternative(template_content, "text/html")
        msg.send()
        return True
      except Exception as e:
        return str(e)



  @staticmethod
  def send_email_invite(email: str, role: str, organization: str, token:str, request=None):
    BASE_URL = settings.BASE_URL
    if request:
      BASE_URL = helpers.get_base_url(request)
    try:
      email_subject = 'VOQDR Organization Invitation.'    
      text_content = settings.PROJECT_NAME + email_subject
      text_template = get_template("email_templates/invite-email.html")
      context_obj = {
        'project_name': settings.PROJECT_NAME,
        'BASE_URL':BASE_URL,
        'LOGO':settings.LOGO,
        'email':email,
        'role':role,
        'organization':organization,
        'token':token
      }
      template_content = text_template.render(context_obj)
      msg = EmailMultiAlternatives(email_subject, text_content,settings.EMAIL_HOST_USER, [email])
      msg.attach_alternative(template_content, "text/html")
      msg.send()
      return True
    except Exception as e:
      return str(e)

  @staticmethod
  def send_approval_status_email(invited_by, invited_to, status, role):
    msg = None
    if status is False:
      msg = "Declined"
    else:
      msg = "Approved"

    try:
      email_subject = 'VOQDR Organization Invitation Status.'
      text_content = settings.PROJECT_NAME + email_subject
      text_template = get_template("email_templates/approval-status-email.html")
      context_obj = {
        'project_name': settings.PROJECT_NAME,
        'LOGO': settings.LOGO,
        'invited_to': invited_to,
        'status': msg,
        'role': role
      }

      template_content = text_template.render(context_obj)
      msg = EmailMultiAlternatives(email_subject, text_content, settings.EMAIL_HOST_USER, [invited_by])
      msg.attach_alternative(template_content, 'text/html')
      msg.send()
      return True
    except Exception as e:
      return str(e)

  @staticmethod
  def send_contact_us_email(user_name, user_email, user_message):
    try:
      email_subject = 'VOQDR Organization Contact Us Email'
      text_content = settings.PROJECT_NAME + email_subject
      text_template = get_template('email_templates/contact-us-email.html')
      context_obj = {
        'project_name': settings.PROJECT_NAME,
        'LOGO': settings.LOGO,
        'name': user_name,
        'email': user_email,
        'message': user_message
      }
      template_content = text_template.render(context_obj)
      msg = EmailMultiAlternatives(email_subject, text_content, settings.EMAIL_HOST_USER, [settings.EMAIL_HOST_USER])
      msg.attach_alternative(template_content, 'text/html')
      msg.send()
      return True
    except Exception as e:
      print(e)