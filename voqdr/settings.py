"""
Django settings for project voqdr.

Generated by 'django-admin startproject' using Django 4.1.4.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.1/ref/settings/
"""

from pathlib import Path
import os
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


MEDIA_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-nuv&7*8@y0dj=e2h))z^f@)m3gos%izkb^qsdq+-j5z*ojuy&z'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # local apps

    'web',
    'users',
    'authentications'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'voqdr.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'voqdr.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases


# For local machine

DATABASES = {
    'default': {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "voqdr",
        "USER": "root",
        "PASSWORD": "",
        "HOST": "127.0.0.1",
        "PORT": "3306"
    }
}   


# For Development Server

# DATABASES = {
#     'default': {
#         "ENGINE": "django.contrib.gis.db.backends.postgis",
#         "NAME": "vodqardevelopment",
#         "USER": "postgres",
#         "PASSWORD": "123456789",
#         "HOST": "",
#         "PORT": "5432"
#     }
# }

# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/

# STATIC_URL = 'static/'
# STATIC_ROOT = "/static/"

# STATICFILES_DIRS = [
#   os.path.join(BASE_DIR, "web/static/")
# ]

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(MEDIA_BASE_DIR,'media')

# STATIC_ROOT = os.path.join(str(BASE_DIR),"web/static/")
AUTH_USER_MODEL = 'users.User'

# Server static folder root
root = Path(__file__).resolve().parent

STATIC_URL = "/static/"
STATICFILES_DIRS = [
    BASE_DIR / "static"
]
STATIC_ROOT = os.path.join(str(root), "static")

# STATIC_URL = "/static/"
# STATICFILES_DIRS = [
#     BASE_DIR / "static"
# ]
# STATIC_ROOT = os.path.join(str(BASE_DIR), "/static")


# For Local Machine

BASE_URL = 'http://127.0.0.1:8000/'

# For Development Server

# BASE_URL = 'http://dev.crymzee.com:7000/'


LOGO = 'http://dev.crymzee.com:7000/static/web/Assets/Images/logo.png'
if DEBUG:
    LOGO = 'http://dev.crymzee.com:7000/static/web/Assets/Images/logo.png'

# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587

# EMAIL_HOST_USER = 'voqdr.site@gmail.com'
# EMAIL_HOST_PASSWORD = 'wbmjpavttuyqdzzu'

EMAIL_HOST_USER = 'khanvoqdr@gmail.com'
EMAIL_HOST_PASSWORD = 'pkqqmydqzkthrlre'

PROJECT_NAME = 'VOQDR'