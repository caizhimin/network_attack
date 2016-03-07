__author__ = 'cai'
from django.conf.urls import url
from . import views
urlpatterns = [url(r'^index/$', views.index, name='index'),
               url(r'^report/$', views.report, name='report'),
               url(r'^canvas/$', views.canvas, name='canvas'),
               url(r'^canvas/json', views.return_json, name='json'),
               url(r'^target_website_count$', views.target_website_count, name='target_website_count'),
               # url(r'^attacker_info$', views.attacker_info, name='attacker_info'),
               url(r'^attack_type_count$', views.attack_type_count, name='attack_type_count'),
               url(r'^attack_location_count$', views.attack_location_count, name='attack_location_count'),
               url(r'^attacked_location_count$', views.attacked_location_count, name='attacked_location_count'),
               url(r'^flow_info/(?P<second>\d+)$', views.flow_info, name='flow_info'),
               url(r'^report_info$', views.report_info, name='report_info'),
               url(r'^attack_flow$', views.attack_flow, name='attack_flow')]