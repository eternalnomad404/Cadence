"""Re-cut food PNGs from studio originals using rembg (clean alpha)."""
from pathlib import Path
from io import BytesIO
from PIL import Image
from rembg import remove

foods = Path(r"G:\Journaling\journal\public\foods")
orig = foods / "_orig_white_bg"

# Worst first, then the rest for consistency
PRIORITY = [
    "namkeen.png",
    "kaju.png",
    "plain-curd.png",
    "taco-bell-potato-taco.png",
    # cooked-rice already recut
    "double-toned-milk.png",
    "roti-plain.png",
    "hp-muesli.png",
    "amul-fresh-paneer.png",
    "milky-mist-hp-paneer.png",
    "whole-truth-whey.png",
    "superyou-protein.png",
    "cheese-slice.png",
    "cucumber.png",
    "soya-bean.png",
    "tomato.png",
    "bread-normal.png",
    "bread-high-protein.png",
    "masala-dosa.png",
    "protein-chips.png",
    "roti-with-ghee.png",
    "veg-burger.png",
    "peanut-butter.png",
    "hp-oats.png",
]


def source_for(name: str) -> Path:
    bak = orig / name
    if bak.exists():
        return bak
    return foods / name


def recut(name: str) -> None:
    src = source_for(name)
    if not src.exists():
        print(f"  SKIP missing {name}")
        return
    print(f"  rembg {name} ...", flush=True)
    data = src.read_bytes()
    out = remove(data)
    img = Image.open(BytesIO(out)).convert("RGBA")
    # Light fringe cleanup: drop near-white ultra-thin alpha rim
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if a < 40 and r > 220 and g > 220 and b > 220:
                px[x, y] = (r, g, b, 0)
            elif a < 180 and r > 245 and g > 245 and b > 245:
                px[x, y] = (r, g, b, max(0, a - 80))
    dest = foods / name
    img.save(dest, optimize=True)
    print(f"  OK {name} -> {dest.stat().st_size // 1024} KB", flush=True)


def main() -> None:
    names = [n for n in PRIORITY if (foods / n).exists() or (orig / n).exists()]
    print(f"Re-cutting {len(names)} images with rembg...")
    for name in names:
        recut(name)
    print("Done.")


if __name__ == "__main__":
    main()
