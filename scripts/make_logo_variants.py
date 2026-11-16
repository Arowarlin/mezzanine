#!/usr/bin/env python3
"""Genera las variantes del logo de Mezzanine sin alterar el original.

Reglas:
- El original (mezzanine-logo-original.png, fondo blanco) nunca se modifica.
- No se redibuja, no se cambia tipografía, forma ni proporción.
- El fondo blanco se convierte en transparencia con "color to alpha":
  los bordes suavizados quedan semitransparentes (sin halo blanco).
- Versión para fondos oscuros: el texto pasa a blanco y las ondas
  conservan su color original.
- Las ondas y los favicons se recortan del original, sin redibujar.

Uso:
    python scripts/make_logo_variants.py
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "client" / "public" / "brand"
PUBLIC = ROOT / "client" / "public"

ORIGINAL = BRAND / "mezzanine-logo-original.png"
COLOR = BRAND / "mezzanine-logo-color.png"
WHITE = BRAND / "mezzanine-logo-white.png"
WAVES = BRAND / "mezzanine-waves.png"

FAVICONS = {
    "favicon-16.png": 16,
    "favicon-32.png": 32,
    "apple-touch-icon.png": 180,
    "icon-192.png": 192,
    "icon-512.png": 512,
}

# Un píxel con canal mínimo <= SOLID_LEVEL es tinta sólida (el interior más
# claro de las ondas llega a ~188). Entre ambos niveles, borde suavizado.
# Por encima de BG_LEVEL se considera fondo: elimina el ruido de compresión
# JPEG (bloques casi blancos) que trae el archivo original.
SOLID_LEVEL = 190
BG_LEVEL = 236
PAD = 8


def color_to_alpha(rgb: np.ndarray) -> np.ndarray:
    """Quita el fondo blanco conservando el antialiasing."""
    rgb = rgb.astype(np.float64)
    dist = BG_LEVEL - rgb.min(axis=2)
    alpha = np.clip(dist / (BG_LEVEL - SOLID_LEVEL), 0.0, 1.0)
    safe = np.where(alpha > 0, alpha, 1.0)[..., None]
    fg = (rgb - 255.0 * (1.0 - alpha[..., None])) / safe
    fg = np.clip(fg, 0, 255)
    return np.dstack([fg, alpha * 255.0]).round().astype(np.uint8)


def crop_to_content(rgba: np.ndarray) -> np.ndarray:
    ys, xs = np.where(rgba[..., 3] > 0)
    y0, y1 = max(ys.min() - PAD, 0), min(ys.max() + PAD + 1, rgba.shape[0])
    x0, x1 = max(xs.min() - PAD, 0), min(xs.max() + PAD + 1, rgba.shape[1])
    return rgba[y0:y1, x0:x1]


def make_dark_bg_version(rgba: np.ndarray) -> np.ndarray:
    """Texto (negro/gris neutro) a blanco; ondas (verde azulado) intactas."""
    out = rgba.copy()
    rgb = rgba[..., :3].astype(int)
    spread = rgb.max(axis=2) - rgb.min(axis=2)
    is_text = (spread < 18) & (rgba[..., 3] > 0)
    _, waves_end = wave_rows(rgba)
    is_text[:waves_end] = False  # las ondas nunca se tocan
    out[is_text, :3] = 255
    return out


def wave_rows(rgba: np.ndarray) -> tuple[int, int]:
    """Filas del bloque de ondas: primer bloque de filas con tinta."""
    has_ink = (rgba[..., 3] > 0).any(axis=1)
    rows = np.where(has_ink)[0]
    start = rows[0]
    end = start
    for r in rows[1:]:
        if r - end > 10:  # hueco entre ondas y la palabra MEZZANINE
            break
        end = r
    return start, end + 1


def save(arr: np.ndarray, path: Path) -> None:
    Image.fromarray(arr, "RGBA").save(path, optimize=True)
    print(f"  {path.relative_to(ROOT)}  {arr.shape[1]}x{arr.shape[0]}")


def main() -> None:
    original = np.array(Image.open(ORIGINAL).convert("RGB"))
    color = crop_to_content(color_to_alpha(original))
    print("Generando variantes:")
    save(color, COLOR)
    save(make_dark_bg_version(color), WHITE)

    y0, y1 = wave_rows(color)
    waves = crop_to_content(color[y0:y1])
    save(waves, WAVES)

    src = Image.fromarray(waves, "RGBA")
    for name, size in FAVICONS.items():
        inner = max(1, round(size * 0.9))
        icon = src.copy()
        icon.thumbnail((inner, inner), Image.LANCZOS)
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        canvas.alpha_composite(icon, ((size - icon.width) // 2, (size - icon.height) // 2))
        canvas.save(PUBLIC / name, optimize=True)
        print(f"  client/public/{name}  {size}x{size}")

    ratio_o = original.shape[1] / original.shape[0]
    print(f"Original sin cambios: {ORIGINAL.name} {original.shape[1]}x{original.shape[0]} (ratio {ratio_o:.3f})")


if __name__ == "__main__":
    main()
