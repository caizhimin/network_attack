# -*- coding: utf-8 -*-
# Generated by Django 1.9c1 on 2015-11-25 01:38
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('UserName', models.CharField(max_length=100, verbose_name='\u7528\u6237\u540d\u79f0')),
                ('Password', models.CharField(max_length=200, verbose_name='\u7528\u6237\u540d\u5bc6\u7801')),
                ('Industry', models.CharField(max_length=100, verbose_name='\u6240\u5904\u884c\u4e1a')),
                ('Phone', models.CharField(blank=True, max_length=20, verbose_name='\u8054\u7cfb\u7535\u8bdd')),
                ('Email', models.CharField(max_length=50, verbose_name='\u7535\u5b50\u90ae\u7bb1')),
            ],
        ),
        migrations.CreateModel(
            name='WarnLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('During', models.IntegerField(verbose_name='\u544a\u8b66\u6301\u7eed\u65f6\u95f4')),
                ('WarnStartTime', models.DateTimeField(blank=True, null=True, verbose_name='\u544a\u8b66\u5f00\u59cb\u65f6\u95f4')),
                ('AttackCount', models.IntegerField(verbose_name='\u653b\u51fb\u6b21\u6570')),
                ('AttackValidCount', models.IntegerField(verbose_name='\u653b\u51fb\u6709\u6548\u6b21\u6570')),
                ('AttackSorts', models.CharField(max_length=100, verbose_name='\u653b\u51fb\u7c7b\u578b')),
                ('MostAttackIP', models.CharField(max_length=100, verbose_name='\u653b\u51fb\u8005IP')),
                ('MostAttackCount', models.IntegerField(verbose_name='\u653b\u51fb\u8005\u7684\u653b\u51fb\u6b21\u6570')),
                ('MostAttackValidCount', models.IntegerField(verbose_name='\u653b\u51fb\u8005\u7684\u653b\u51fb\u6709\u6548\u6b21\u6570')),
                ('MostAttackLocation', models.CharField(max_length=200, verbose_name='\u653b\u51fb\u8005\u4f4d\u7f6e')),
            ],
        ),
        migrations.CreateModel(
            name='Website',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Domain', models.CharField(max_length=300, verbose_name='\u7f51\u7ad9\u57df\u540d')),
                ('OS', models.CharField(max_length=300, verbose_name='\u64cd\u4f5c\u7cfb\u7edf')),
                ('Database', models.CharField(blank=True, max_length=100, verbose_name='\u6570\u636e\u5e93\u578b\u53f7')),
                ('WebSystem', models.CharField(blank=True, max_length=100, verbose_name='Web\u7cfb\u7edf\u6846\u67b6\u6280\u672f')),
                ('IP', models.CharField(max_length=100, verbose_name='\u7f51\u7ad9IP\u5730\u5740')),
                ('GEO', models.CharField(max_length=200, verbose_name='\u7f51\u7ad9\u5730\u7406\u4f4d\u7f6e')),
                ('UserID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='website_user.User', verbose_name='\u6240\u5c5eUserID')),
            ],
        ),
        migrations.CreateModel(
            name='WebSiteReport',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Score', models.IntegerField(verbose_name='\u76d1\u63a7\u5f97\u5206')),
                ('RiskRank', models.IntegerField(verbose_name='\u98ce\u9669\u7b49\u7ea7')),
                ('ReportStartTime', models.DateTimeField(verbose_name='\u51fa\u62a5\u8868\u7684\u65f6\u95f4')),
                ('During', models.IntegerField(verbose_name='\u62a5\u8868\u7edf\u8ba1\u7684\u65f6\u95f4\u8303\u56f4')),
                ('AttackSorts', models.CharField(max_length=100, verbose_name='\u653b\u51fb\u7c7b\u578b')),
                ('AttackCount', models.IntegerField(verbose_name='\u653b\u51fb\u6b21\u6570')),
                ('AttackValidCount', models.IntegerField(verbose_name='\u653b\u51fb\u6709\u6548\u6b21\u6570')),
                ('MostAttackIP', models.CharField(max_length=100, verbose_name='\u653b\u51fb\u8005IP')),
                ('MostAttackCount', models.IntegerField(verbose_name='\u653b\u51fb\u8005\u7684\u653b\u51fb\u6b21\u6570')),
                ('MostAttackValidCount', models.IntegerField(verbose_name='\u653b\u51fb\u8005\u7684\u653b\u51fb\u6709\u6548\u6b21\u6570')),
                ('MostAttackLocation', models.CharField(max_length=200, verbose_name='\u653b\u51fb\u8005\u4f4d\u7f6e')),
                ('WebsiteID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='website_user.Website', verbose_name='\u62a5\u8868\u7684\u6240\u5c5e\u7f51\u7ad9ID')),
            ],
        ),
        migrations.AddField(
            model_name='warnlog',
            name='WebsiteId',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='website_user.Website', verbose_name='\u6240\u5c5e\u7f51\u7ad9ID'),
        ),
    ]
