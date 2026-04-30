import re

text = open('src/content/reviews/jobnimbus.mdx').read()
body = re.sub(r'^---\n(.*?)\n---\n', '', text, flags=re.DOTALL, count=1)
clean = re.sub(r'\u003c[^\u003e]+\u003e', ' ', body)
clean = re.sub(r'[#*|*\[\]\(\)\-_`\u003e]', ' ', clean)
words = [w for w in clean.split() if w.strip()]
print('JobNimbus review: %d words' % len(words))
