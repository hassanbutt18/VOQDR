# Generated by Django 4.1.5 on 2023-01-07 10:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_alter_user_code_alter_user_name_alter_user_token'),
    ]

    operations = [
        migrations.CreateModel(
            name='InvitedOrganization',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(blank=True, max_length=254, null=True)),
                ('role', models.CharField(default='viewer', max_length=15)),
                ('is_verified', models.BooleanField(verbose_name=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
