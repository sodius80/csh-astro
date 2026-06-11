"""Fix all raw <script type="application/ld+json"> blocks in MDX files.

Converts them to use dangerouslySetInnerHTML which avoids MDX parser
conflicts with curly braces in JSON-LD schema markup.
"""
import re
import os
import glob

MDX_DIR = 'src/content'
# Pattern for raw <script type="application/ld+json">...</script> blocks
# This catches both multiline raw blocks and single-line template-literal blocks
RAW_PATTERN = re.compile(
    r'<script type="application/ld\+json">\s*((?:\{`)?\s*(.*?)\s*(?:`\})?)\s*</script>',
    re.DOTALL
)

def extract_json(text):
    """Extract just the JSON content from a script tag body."""
    text = text.strip()
    # Handle the {``} template literal wrapper if present
    if text.startswith('{`') and text.endswith('`}'):
        text = text[2:-2]
    # Handle raw { JSON } without template literal
    elif text.startswith('{') and not text.startswith('{`'):
        pass  # Keep as-is, it's raw JSON
    return text

def convert_script(match):
    """Convert a matched script block to dangerouslySetInnerHTML."""
    body = match.group(1)
    json_str = extract_json(body)
    
    # Escape backticks, backslashes, and ${} for template literal safety
    safe_json = json_str.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
    return '<script type="application/ld+json" dangerouslySetInnerHTML={{__html: `' + safe_json + '`}} />'

def main():
    fixed_count = 0
    file_count = 0
    
    for root, dirs, files in os.walk(MDX_DIR):
        for fname in files:
            if not fname.endswith('.mdx'):
                continue
            fpath = os.path.join(root, fname)
            with open(fpath) as f:
                content = f.read()
            
            # Skip files without script type
            if '<script type="application/ld+json"' not in content:
                continue
            
            new_content, count = RAW_PATTERN.subn(convert_script, content)
            
            if count > 0:
                with open(fpath, 'w') as f:
                    f.write(new_content)
                print(f"[FIXED] {fpath} ({count} block(s))")
                fixed_count += count
                file_count += 1
    
    print(f"\nDone. Fixed {fixed_count} JSON-LD block(s) in {file_count} file(s).")

if __name__ == '__main__':
    main()
