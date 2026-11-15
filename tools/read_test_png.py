#!/usr/bin/env python3
"""Unpack a "💾 เก็บภาพทดสอบ" file: prints the boxes / last read, and writes the turned-down read crops next to it
(<file>-miss-meso-1.png …) so they can become test fixtures.  Usage: tools/read_test_png.py logbook-test-….png"""
import sys,struct,json,zlib,base64,os
p=sys.argv[1];b=open(p,'rb').read();i=8;info=None
while i<len(b):
    n=struct.unpack('>I',b[i:i+4])[0];t=b[i+4:i+8];d=b[i+8:i+8+n];i+=12+n
    if t==b'tEXt' and d.startswith(b'logbook\0'):info=json.loads(d[8:].decode('utf-8'))
if not info:sys.exit('no LogBook data in this PNG')
m=info.pop('misses',None) or {}
print(json.dumps(info,ensure_ascii=False,indent=1))
base=os.path.splitext(p)[0]
for k,L in m.items():
    for j,x in enumerate(L,1):
        f=f'{base}-miss-{k}-{j}.png';open(f,'wb').write(base64.b64decode(x['img'].split(',')[1]))
        print(f'{f}: read {x["read"]} raw {x["raw"]!r} (tracker had {x["now"]})')
