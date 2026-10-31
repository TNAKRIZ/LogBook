#!/usr/bin/env python3
"""Embed every icon in assets/icons/<gameId>.png into index.html (const ITEM_IMG=...).

The page stays a single self-contained file (works offline / when saved),
while the icons themselves are fetched by .github/workflows/fetch-icons.yml.
Run from the repo root:  python3 tools/embed_icons.py
"""
import base64, json, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
html = root / 'index.html'
icons = {}
for f in sorted((root / 'assets' / 'icons').glob('*.png')):
    if f.stem.isdigit():
        icons[f.stem] = 'data:image/png;base64,' + base64.b64encode(f.read_bytes()).decode()
s = html.read_text(encoding='utf-8')
start = s.index('const ITEM_IMG=')
end = s.index('};', start) + 2
s = s[:start] + 'const ITEM_IMG=' + json.dumps(icons, separators=(',', ':')) + ';' + s[end:]
html.write_text(s, encoding='utf-8')
print(f'embedded {len(icons)} icons')
