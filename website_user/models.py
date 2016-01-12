# coding: utf8
from __future__ import unicode_literals

from django.db import models

# Create your models here.


class User(models.Model):
    UserName = models.CharField(max_length=100, verbose_name='用户名称')
    Password = models.CharField(max_length=200, verbose_name='用户名密码')
    Industry = models.CharField(max_length=100, verbose_name='所处行业')
    Phone = models.CharField(max_length=20, blank=True, verbose_name='联系电话')
    Email = models.CharField(max_length=50, verbose_name='电子邮箱')


class Website(models.Model):
    UserID = models.ForeignKey(User, verbose_name='所属UserID')
    Domain = models.CharField(max_length=300, verbose_name='网站域名')
    OS = models.CharField(max_length=300, verbose_name='操作系统')
    Database = models.CharField(max_length=100, blank=True, verbose_name='数据库型号')
    WebSystem = models.CharField(max_length=100, blank=True, verbose_name='Web系统框架技术')
    IP = models.CharField(max_length=100, verbose_name='网站IP地址')
    GEO = models.CharField(max_length=200, verbose_name='网站地理位置')


class WarnLog(models.Model):
    WebsiteId = models.ForeignKey(Website, verbose_name='所属网站ID')
    During = models.IntegerField(verbose_name='告警持续时间')
    WarnStartTime = models.DateTimeField(blank=True, null=True, verbose_name='告警开始时间')
    AttackCount = models.IntegerField(verbose_name='攻击次数')
    AttackValidCount = models.IntegerField(verbose_name='攻击有效次数')
    AttackSorts = models.CharField(max_length=100, verbose_name='攻击类型')
    MostAttackIP = models.CharField(max_length=100, verbose_name='攻击者IP')
    MostAttackCount = models.IntegerField(verbose_name='攻击者的攻击次数')
    MostAttackValidCount = models.IntegerField(verbose_name='攻击者的攻击有效次数')
    MostAttackLocation = models.CharField(max_length=200, verbose_name='攻击者位置')


class WebSiteReport(models.Model):
    WebsiteID = models.ForeignKey(Website, verbose_name='报表的所属网站ID')
    Score = models.IntegerField(verbose_name='监控得分')
    RiskRank = models.IntegerField(verbose_name='风险等级')
    ReportStartTime = models.DateTimeField(verbose_name='出报表的时间')
    During = models.IntegerField(verbose_name='报表统计的时间范围')
    AttackSorts = models.CharField(max_length=100, verbose_name='攻击类型')
    AttackCount = models.IntegerField(verbose_name='攻击次数')
    AttackValidCount = models.IntegerField(verbose_name='攻击有效次数')
    MostAttackIP = models.CharField(max_length=100, verbose_name='攻击者IP')
    MostAttackCount = models.IntegerField(verbose_name='攻击者的攻击次数')
    MostAttackValidCount = models.IntegerField(verbose_name='攻击者的攻击有效次数')
    MostAttackLocation = models.CharField(max_length=200, verbose_name='攻击者位置')