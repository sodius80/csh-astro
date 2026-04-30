import json
from pathlib import Path
from PIL import Image

root = Path.home() / 'csh-astro' / 'public' / 'images'
dims = {}

for f in sorted(root.iterdir()):
    if f.suffix.lower() in ['.jpg','.jpeg','.png','.webp','.gif']:
        try:
            with Image.open(f) as img:
                dims[f.name] = {"width": img.width, "height": img.height}
        except Exception:
            pass

out = Path.home() / 'csh-astro' / 'src' / 'data' / 'imageDims.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(dims, indent=2))

print(f"Mapped {len(dims)} images to dimensions → {out}")
