# Generated by Django 4.1.5 on 2023-01-07 12:43

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0014_remove_sharedorganization_user_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='invitedorganization',
            name='user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.DO_NOTHING, related_name='invite_by_organization', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='sharedorganization',
            name='user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.DO_NOTHING, related_name='shared_by_organization', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
