# Generated by Django 4.1.5 on 2023-01-07 12:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0015_invitedorganization_user_sharedorganization_user'),
    ]

    operations = [
        migrations.RenameField(
            model_name='invitedorganization',
            old_name='user',
            new_name='invite_by',
        ),
        migrations.RenameField(
            model_name='invitedorganization',
            old_name='email',
            new_name='invite_to',
        ),
        migrations.RenameField(
            model_name='sharedorganization',
            old_name='user',
            new_name='invite_by',
        ),
        migrations.RenameField(
            model_name='sharedorganization',
            old_name='email',
            new_name='invite_to',
        ),
    ]
