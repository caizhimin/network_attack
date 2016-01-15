# coding: utf8
from __future__ import unicode_literals

from django.db import models

# Create your models here.


class Flow(models.Model):
    URL = models.CharField(max_length=100, verbose_name='url')
    NetProType = models.CharField(max_length=30, blank=True, null=True, verbose_name='网络协议类型')
    MesHeader = models.CharField(max_length=200, blank=True, null=True, verbose_name='报文头')
    MesBody = models.TextField(blank=True, null=True, verbose_name='报文内容')
    ResponseCode = models.CharField(max_length=100, blank=True, null=True, verbose_name='响应代码')
    ResponseBody = models.TextField(blank=True, null=True, verbose_name='响应正文')
    SrcIP = models.CharField(max_length=50, blank=True, null=True, verbose_name='源IP')
    SrcPort = models.CharField(max_length=20, blank=True, null=True, verbose_name='源端口')
    SrcGeoPos = models.CharField(max_length=100, null=True, blank=True, verbose_name='源地理位置')
    SrcWlan = models.CharField(max_length=100, blank=True, null=True, verbose_name='源城域网')
    DescIP = models.CharField(max_length=50, blank=True, null=True, verbose_name='目的IP')
    DescPort = models.CharField(max_length=50, blank=True, null=True, verbose_name='目的端口')
    DescGeoPos = models.CharField(max_length=100, null=True, blank=True, verbose_name='目的地理位置')
    DescWlan = models.CharField(max_length=100, blank=True, null=True, verbose_name='目的地城域网')
    DPI_Byte = models.CharField(max_length=50, blank=True, null=True, verbose_name='DPI流量字节数')
    DPI_Packet = models.CharField(max_length=50, blank=True, null=True, verbose_name='DPI流量数据包个数')
    UTC_Time = models.DateTimeField(blank=True, null=True, verbose_name='UTC时间')
    AttType = models.IntegerField(blank=True, null=True, verbose_name='攻击类型')


class AttTypeInfo(models.Model):
    AttType = models.IntegerField(null=True, blank=True, verbose_name='攻击类型')
    AttTypeDesc = models.CharField(max_length=100, blank=True, null=True, verbose_name='攻击类型说明')
    AttOpinion = models.CharField(max_length=200, blank=True, null=True, verbose_name='攻击防范建议')


class IpAddressLib(models.Model):
    StartIpSeg = models.CharField(max_length=50, null=True, blank=True, verbose_name='起始ip段地址')
    StartIpSegNum = models.BigIntegerField(null=True, blank=True, verbose_name='起始ip段地址Num')
    EndIpSeg = models.CharField(max_length=50, null=True, blank=True, verbose_name='结束ip段地址')
    EndIpSegNum = models.BigIntegerField(null=True, blank=True, verbose_name='起始ip段地址Num')
    ProvinceLocation = models.CharField(max_length=30, null=True, blank=True, verbose_name='省份')
    CityLocation = models.CharField(max_length=30, null=True, blank=True, verbose_name='城市')

# class SQLInjecResult(models.Model):
#     Flow_ID = models.ForeignKey(Flow, null=True, blank=True, verbose_name='对应DPI流量ID')
#     SrcIP = models.CharField(max_length=50, blank=True, null=True, verbose_name='源IP')
#     SrcPort = models.IntegerField(blank=True, null=True, verbose_name='源端口')
#     SrcLocation = models.CharField(max_length=100, blank=True, null=True, verbose_name='攻击来源地')
#     DestIP = models.CharField(max_length=50, blank=True, null=True, verbose_name='目的IP')
#     DescPort = models.IntegerField(blank=True, null=True, verbose_name='目的端口')
#     DestLocation = models.CharField(max_length=100, blank=True, null=True, verbose_name='攻击目的地')
#     AttTime = models.DateTimeField(blank=True, null=True, verbose_name='攻击时间')
#     SqlInjAttPackNum = models.IntegerField(blank=True, null=True, verbose_name='SQL注入攻击流量数据包个数')
#     SqlInjAttByte = models.IntegerField(blank=True, null=True, verbose_name='SQL注入攻击流量字节数')
#     SqlInjValidAtt = models.NullBooleanField(null=True, verbose_name='SQL注入有效攻击标识')
#     SqlInjAttType = models.IntegerField(blank=True, null=True, verbose_name='SQL注入攻击类型')
#     SqlInjAttLevel = models.IntegerField(blank=True, null=True, verbose_name='SQL注入攻击风险等级')
#
#     def __unicode__(self):
#         return self.DestIP
#
#
# class XSSResult(models.Model):
#     Flow_ID = models.ForeignKey(Flow, null=True, blank=True, verbose_name='对应DPI流量ID')
#     SrcIP = models.CharField(max_length=50, blank=True, null=True, verbose_name='源IP')
#     SrcPort = models.IntegerField(blank=True, null=True, verbose_name='源端口')
#     SrcLocation = models.CharField(max_length=100, blank=True, null=True, verbose_name='攻击来源地')
#     DestIP = models.CharField(max_length=50, blank=True, null=True, verbose_name='目的IP')
#     DescPort = models.IntegerField(blank=True, null=True, verbose_name='目的端口')
#     DestLocation = models.CharField(max_length=100, blank=True, null=True, verbose_name='攻击目的地')
#     AttTime = models.DateTimeField(blank=True, null=True, verbose_name='攻击时间')
#     XssAttPackNum = models.IntegerField(blank=True, null=True, verbose_name='XSS攻击流量数据包个数')
#     XssAttByte = models.IntegerField(blank=True, null=True, verbose_name='Xss攻击流量字节数')
#     XssValidAtt = models.NullBooleanField(null=True, verbose_name='Xss有效攻击标识')
#     XssAttType = models.IntegerField(blank=True, null=True, verbose_name='Xss攻击类型')
#     XssAttLevel = models.IntegerField(blank=True, null=True, verbose_name='Xss攻击风险等级')
#
#
# class WebBDResult(models.Model):
#     Flow_ID = models.ForeignKey(Flow, null=True, blank=True, verbose_name='对应DPI流量ID')
#     SrcIP = models.CharField(max_length=50, blank=True, null=True, verbose_name='源IP')
#     SrcPort = models.IntegerField(blank=True, null=True, verbose_name='源端口')
#     SrcLocation = models.CharField(max_length=100, blank=True, null=True, verbose_name='攻击来源地')
#     DestIP = models.CharField(max_length=50, blank=True, null=True, verbose_name='目的IP')
#     DescPort = models.IntegerField(blank=True, null=True, verbose_name='目的端口')
#     DestLocation = models.CharField(max_length=100, blank=True, null=True, verbose_name='攻击目的地')
#     AttTime = models.DateTimeField(blank=True, null=True, verbose_name='攻击时间')
#     WebShellAttPackNum = models.IntegerField(blank=True, null=True, verbose_name='Web后门攻击流量数据包个数')
#     WebShellAttByte = models.IntegerField(blank=True, null=True, verbose_name='Web后门攻击流量字节数')
#     WebShellValidAtt = models.NullBooleanField(null=True, verbose_name='Web后门有效攻击标识')
#     WebShellAttType = models.IntegerField(blank=True, null=True, verbose_name='Web后门攻击类型')
#     WebShellAttLevel = models.IntegerField(blank=True, null=True, verbose_name='Web后门攻击风险等级')
#
#
# class RCResult(models.Model):
#     Flow_ID = models.ForeignKey(Flow, null=True, blank=True, verbose_name='对应DPI流量ID')
#     SrcIP = models.CharField(max_length=50, blank=True, null=True, verbose_name='源IP')
#     SrcPort = models.IntegerField(blank=True, null=True, verbose_name='源端口')
#     SrcLocation = models.CharField(max_length=100, blank=True, null=True, verbose_name='攻击来源地')
#     DestIP = models.CharField(max_length=50, blank=True, null=True, verbose_name='目的IP')
#     DescPort = models.IntegerField(blank=True, null=True, verbose_name='目的端口')
#     DestLocation = models.CharField(max_length=100, blank=True, null=True, verbose_name='攻击目的地')
#     AttTime = models.DateTimeField(blank=True, null=True, verbose_name='攻击时间')
#     RCE_AttPackNum = models.IntegerField(blank=True, null=True, verbose_name='远程命令执行攻击流量数据包个数')
#     RCE_AttByte = models.IntegerField(blank=True, null=True, verbose_name='远程命令执行攻击流量字节数')
#     RCE_ValidAtt = models.NullBooleanField(null=True, verbose_name='远程命令执行有效攻击标识')
#     RCE_AttType = models.IntegerField(blank=True, null=True, verbose_name='远程命令执行攻击类型')
#     RCE_AttLevel = models.IntegerField(blank=True, null=True, verbose_name='远程命令执行攻击风险等级')
#
#
# class FCResult(models.Model):
#     Flow_ID = models.ForeignKey(Flow, null=True, blank=True, verbose_name='对应DPI流量ID')
#     SrcIP = models.CharField(max_length=50, blank=True, null=True, verbose_name='源IP')
#     SrcPort = models.IntegerField(blank=True, null=True, verbose_name='源端口')
#     SrcLocation = models.CharField(max_length=100, blank=True, null=True, verbose_name='攻击来源地')
#     DestIP = models.CharField(max_length=50, blank=True, null=True, verbose_name='目的IP')
#     DescPort = models.IntegerField(blank=True, null=True, verbose_name='目的端口')
#     DestLocation = models.CharField(max_length=100, blank=True, null=True, verbose_name='攻击目的地')
#     AttTime = models.DateTimeField(blank=True, null=True, verbose_name='攻击时间')
#     FileInAttPackNum = models.IntegerField(blank=True, null=True, verbose_name='文件包含攻击流量数据包个数')
#     FileInAttByte = models.IntegerField(blank=True, null=True, verbose_name='文件包含攻击流量字节数')
#     FileInValidAtt = models.NullBooleanField(null=True, verbose_name='文件包含有效攻击标识')
#     FileInAttType = models.IntegerField(blank=True, null=True, verbose_name='文件包含攻击类型')
#     FileInAttLevel = models.IntegerField(blank=True, null=True, verbose_name='文件包含攻击风险等级')
