with open('src/content/reviews/elromco-review-2026.mdx') as f:
    lines = f.readlines()
line = lines[282]  # 0-indexed, line 283
print(f'Line length: {len(line)}')
print(f'Column 38 chars: {repr(line[37:45])}')
print(f'Full line start: {repr(line[:60])}')
print(f'Full line end: {repr(line[-50:])}')
for i, c in enumerate(line):
    if c in '{}`':
        print(f'  pos {i+1}: {repr(c)}')
