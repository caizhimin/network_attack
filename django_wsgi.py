# coding: utf-8
import os
import django.core.handlers.wsgi
import django
os.environ['DJANGO_SETTINGS_MODULE'] = 'network_attack.settings'  # 这里的my_django.settings 表示 "项目名.settings"
django.setup()
application = django.core.handlers.wsgi.WSGIHandler()