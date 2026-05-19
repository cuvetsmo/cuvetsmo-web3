"""
Generate OG image (1200x630) + favicon for web3.cuvetsmo.com.

Run from repo root:
    python scripts/build-og.py

Outputs:
    public/og.png   — 1200x630 social card
    public/favicon.ico — multi-size ICO from smo-logo

Design notes:
- Uses Leelawadee UI Bold / Regular (Thai-capable) + Segoe UI for English.
- No emoji on the canvas (PIL can't render color emoji reliably across
  Windows versions). Pillars rendered as text + colored dot.
- Background: subtle radial brand-tinted backdrop on light stone-50.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Paths
HERE = Path(__file__).resolve().parent.parent
PUBLIC = HERE / "public"
LOGO = PUBLIC / "smo-logo.png"
OG_OUT = PUBLIC / "og.png"
FAVICON_OUT = PUBLIC / "favicon.ico"

# Brand tokens
BRAND = (3, 105, 161)            # sky-700
BRAND_DARK = (12, 74, 110)       # sky-800
BRAND_LIGHT = (224, 242, 254)    # sky-100
BG = (250, 250, 249)             # stone-50
TEXT = (28, 25, 23)              # stone-900
MUTED = (87, 83, 78)             # stone-600
BORDER = (231, 229, 228)         # stone-200

WIDTH, HEIGHT = 1200, 630

# Font paths (Windows) — Leelawadee UI has Thai glyphs
THAI_BOLD = r"C:\Windows\Fonts\leelawdb.ttf"   # Leelawadee Bold
THAI_REG = r"C:\Windows\Fonts\leelawad.ttf"    # Leelawadee Regular
EN_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"     # Segoe UI Bold
EN_REG = r"C:\Windows\Fonts\segoeui.ttf"       # Segoe UI Regular


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def render_og() -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)

    # Soft brand-tinted radial backdrop (top-left)
    backdrop = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    bd = ImageDraw.Draw(backdrop)
    for r in range(1000, 200, -40):
        alpha = max(0, int(50 - r * 0.04))
        bd.ellipse(
            [-r // 3, -r // 2, r * 1.3, r * 1.1],
            fill=(*BRAND_LIGHT, alpha),
        )
    backdrop = backdrop.filter(ImageFilter.GaussianBlur(28))
    img.paste(backdrop, (0, 0), backdrop)

    draw = ImageDraw.Draw(img)

    # Top thin brand bar
    draw.rectangle([0, 0, WIDTH, 6], fill=BRAND)

    # Logo (top-left)
    logo = Image.open(LOGO).convert("RGBA")
    logo_size = 88
    logo_resized = logo.resize((logo_size, logo_size), Image.LANCZOS)
    img.paste(logo_resized, (72, 72), logo_resized)

    # Wordmark next to logo
    draw.text((180, 84), "web3.cuvetsmo.com", font=font(EN_BOLD, 30), fill=TEXT)
    draw.text(
        (180, 124),
        "Web3 Playground for Thai Vet Students",
        font=font(EN_REG, 17),
        fill=MUTED,
    )

    # Main title — Thai (uses Leelawadee Bold).
    # Title left column is x=72 → 800 (right pillars start at 820).
    title_th_top = "เครื่องมือ Web3 สำหรับ"
    draw.text((72, 230), title_th_top, font=font(THAI_BOLD, 56), fill=TEXT)
    title_th_bot = "นิสิตสัตวแพทย์ จุฬาฯ"
    draw.text((72, 298), title_th_bot, font=font(THAI_BOLD, 56), fill=BRAND)

    # English tagline (light)
    draw.text(
        (72, 400),
        "Learn  ·  Play  ·  Build  ·  The Lab",
        font=font(EN_BOLD, 28),
        fill=BRAND_DARK,
    )
    draw.text(
        (72, 446),
        "A web3 playground built by Thai vet students.",
        font=font(EN_REG, 20),
        fill=MUTED,
    )

    # Bottom trust signal
    draw.text(
        (72, 540),
        "Built on Base   ·   powered by CUVETSMO   ·   educational testnet",
        font=font(EN_REG, 18),
        fill=MUTED,
    )

    # Right column — 4 pillar chips
    chip_x = 820
    chip_w = 308
    chip_h = 68
    chip_gap = 14
    chip_y_start = 240
    chips = [
        ("Learn", "เรียนรู้", (14, 165, 233)),     # sky-500
        ("Play", "ทดลอง", (16, 185, 129)),         # emerald-500
        ("Build", "สร้าง", (245, 158, 11)),        # amber-500
        ("The Lab", "ห้องแล็บ", (168, 85, 247)),  # purple-500
    ]
    for i, (en, th, dot) in enumerate(chips):
        y = chip_y_start + i * (chip_h + chip_gap)
        draw.rounded_rectangle(
            [chip_x, y, chip_x + chip_w, y + chip_h],
            radius=14,
            fill=(255, 255, 255),
            outline=BORDER,
            width=2,
        )
        # Colored dot
        cx, cy = chip_x + 32, y + chip_h // 2
        draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=dot)
        # EN label (bold)
        draw.text((chip_x + 56, y + 12), en, font=font(EN_BOLD, 20), fill=TEXT)
        # TH label (regular muted)
        draw.text((chip_x + 56, y + 39), th, font=font(THAI_REG, 14), fill=MUTED)

    OG_OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OG_OUT, format="PNG", optimize=True)
    print(f"wrote {OG_OUT} ({OG_OUT.stat().st_size // 1024} KB)")


def render_favicon() -> None:
    logo = Image.open(LOGO).convert("RGBA")
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    favicon = logo.resize((256, 256), Image.LANCZOS)
    favicon.save(FAVICON_OUT, format="ICO", sizes=sizes)
    print(f"wrote {FAVICON_OUT} ({FAVICON_OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    render_og()
    render_favicon()
