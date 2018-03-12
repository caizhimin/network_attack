# coding:utf8
from __future__ import unicode_literals
from django.test import TestCase
import requests

# Create your tests here.
import MySQLdb
conn=MySQLdb.connect(host="180.100.230.182",user="bigdata",passwd="!Q2w#E4r",db="network_attack", charset='utf8')
a='淮安'
cur=conn.cursor()
# for i in xrange(0, 10):
#     ip = cur.execute("select DescIP from flow_flow where id=%s" % i)
cur.execute('update flow_flow set SrcGeoPos="淮安"')
cur.execute('select DescIP,id from flow_flow ORDER by id DESC')
for row in cur.fetchall():
    _id = row[1]
    ip = row[0]
    headers = {'apikey': '24e16647f7490e170d68de37bc7254fc'}
    r = requests.get('http://apis.baidu.com/apistore/iplookupservice/iplookup?ip=%s' % ip, headers=headers)
    try:
        data = r.json()['retData']
        if data['city'] == 'None':
            desc_pos = data['province']
            if data['province'] == 'None':
                desc_pos = data['country']
        else:
            desc_pos = data['city']
    except:
        desc_pos = ''
    print _id, desc_pos
    cur.execute("update flow_flow set DescGeoPos='%s' where id=%s" % (desc_pos,_id))
conn.commit()