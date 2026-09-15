"""Knock out connected studio-white backgrounds from food menu PNGs."""
from pathlib import Path
from collections import deque
from PIL import Image

foods = Path(r"G:\Journaling\journal\public\foods")
backup = foods / "_orig_white_bg"
backup.mkdir(exist_ok=True)


def near_white(r: int, g: int, b: int, thresh: int = 238) -> bool:
    return r >= thresh and g >= thresh and b >= thresh


def remove_studio_bg(src: Path, dest: Path) -> None:
    img = Image.open(src).convert("RGBA")
    w, h = img.size
    px = img.load()

    visited = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()

    def idx(x: int, y: int) -> int:
        return y * w + x

    def try_seed(x: int, y: int) -> None:
        r, g, b, a = px[x, y]
        if a == 0:
            return
        if near_white(r, g, b):
            i = idx(x, y)
            if visited[i]:
                return
            visited[i] = 1
            q.append((x, y))

    for x in range(w):
        try_seed(x, 0)
        try_seed(x, h - 1)
    for y in range(h):
        try_seed(0, y)
        try_seed(w - 1, y)

    while q:
        x, y = q.popleft()
        r, g, b, _ = px[x, y]
        whiteness = (r + g + b) / 3.0
        if whiteness >= 250:
            alpha = 0
        elif whiteness >= 238:
            alpha = int(255 * (250 - whiteness) / 12)
        else:
            alpha = 0
        px[x, y] = (r, g, b, alpha)

        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if nx < 0 or ny < 0 or nx >= w or ny >= h:
                continue
            i = idx(nx, ny)
            if visited[i]:
                continue
            nr, ng, nb, na = px[nx, ny]
            if na == 0:
                visited[i] = 1
                continue
            # Connected near-white studio bg (low chroma)
            if near_white(nr, ng, nb, thresh=230) and max(nr, ng, nb) - min(nr, ng, nb) < 18:
                visited[i] = 1
                q.append((nx, ny))

    img.save(dest, optimize=True)


done: list[str] = []
for path in sorted(foods.glob("*.png")):
    if path.name.startswith("_"):
        continue
    bak = backup / path.name
    if not bak.exists():
        bak.write_bytes(path.read_bytes())
    remove_studio_bg(bak, path)
    done.append(path.name)

print(f"Processed {len(done)} images")
for name in done:
    print(f"  {name}")
