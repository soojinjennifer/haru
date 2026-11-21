"""S8-H baseline diff 연결성분 분해 (R-BASELINE-1 ⑤).

usage: python3 -I decompose.py <before_dir> <after_dir> <out_json>
두 디렉토리에서 바이트가 다른 png 쌍마다 채널차 > 5 픽셀을 2px 병합 연결성분으로 묶어
bbox · 픽셀 수 · 최대 채널차 · 성분 안 before/after 대표색을 낸다.
"""
import hashlib, json, os, sys
from PIL import Image

before, after, out = sys.argv[1], sys.argv[2], sys.argv[3]

def md5(p):
    return hashlib.md5(open(p, 'rb').read()).hexdigest()

results = []
for dirpath, _, files in os.walk(after):
    for name in files:
        if not name.endswith('.png'):
            continue
        rel = os.path.relpath(os.path.join(dirpath, name), after)
        a_path, b_path = os.path.join(before, rel), os.path.join(after, rel)
        if not os.path.exists(a_path):
            results.append({'file': rel, 'status': 'new'})
            continue
        if md5(a_path) == md5(b_path):
            continue
        a = Image.open(a_path).convert('RGB'); b = Image.open(b_path).convert('RGB')
        if a.size != b.size:
            results.append({'file': rel, 'status': 'size', 'before': a.size, 'after': b.size})
            continue
        w, h = a.size
        pa, pb = a.load(), b.load()
        diff = set()
        maxd = 0
        for y in range(h):
            for x in range(w):
                d = max(abs(pa[x, y][i] - pb[x, y][i]) for i in range(3))
                if d > 5:
                    diff.add((x, y))
                maxd = max(maxd, d)
        seen, comps = set(), []
        for p in diff:
            if p in seen:
                continue
            stack, comp = [p], []
            seen.add(p)
            while stack:
                x, y = stack.pop(); comp.append((x, y))
                for dx in range(-2, 3):
                    for dy in range(-2, 3):
                        q = (x + dx, y + dy)
                        if q in diff and q not in seen:
                            seen.add(q); stack.append(q)
            xs = [c[0] for c in comp]; ys = [c[1] for c in comp]
            comps.append({'bbox': [min(xs), min(ys), max(xs) - min(xs) + 1, max(ys) - min(ys) + 1],
                          'px': len(comp),
                          'maxd': max(max(abs(pa[x, y][i] - pb[x, y][i]) for i in range(3)) for x, y in comp)})
        comps.sort(key=lambda c: -c['px'])
        results.append({'file': rel, 'status': 'changed', 'size': [w, h], 'maxChannelDelta': maxd,
                        'pixelsOver5': len(diff), 'components': comps[:30], 'componentCount': len(comps)})
for dirpath, _, files in os.walk(before):
    for name in files:
        rel = os.path.relpath(os.path.join(dirpath, name), before)
        if name.endswith('.png') and not os.path.exists(os.path.join(after, rel)):
            results.append({'file': rel, 'status': 'removed'})
json.dump(results, open(out, 'w'), indent=1, ensure_ascii=False)
for r in results:
    print(r['file'], r['status'], r.get('pixelsOver5'), r.get('maxChannelDelta'), r.get('componentCount'))
