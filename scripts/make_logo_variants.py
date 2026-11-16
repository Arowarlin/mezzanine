#!/usr/bin/env python3
"""Genera las variantes del logo de Mezzanine sin alterar el original.

Reglas:
- Solo se recortan márgenes vacíos.
- Solo se elimina el fondo blanco puro (#FFFFFF) conectado al borde.
- La versión blanca conserva el alfa y pinta de blanco los píxeles opacos.
- Las ondas se recortan de la parte superior, sin redibujarlas.
- Los favicons se centran en un lienzo cuadrado transparente.

Uso:
    python scripts/make_logo_variants.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

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


def content_bbox(image: Image.Image, threshold: int = 6) -> tuple[int, int, int, int]:
    """Devuelve el rectángulo de píxeles que no son fondo blanco."""
    white = Image.new("RGB", image.size, (255, 255, 255))
    diff = ImageChops.difference(image.convert("RGB"), white).convert("L")
    mask = diff.point(lambda value: 255 if value > threshold else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("La imagen no tiene contenido visible.")
    return bbox


def remove_white_background(image: Image.Image) -> Image.Image:
    """Hace transparente el blanco puro conectado al borde."""
    rgba = image.convert("RGBA")
    width, height = rgba.size
    corners = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    filled = False
    for corner in corners:
        if rgba.getpixel(corner) == (255, 255, 255, 255):
            ImageDraw.floodfill(rgba, corner, (255, 255, 255, 0), thresh=0)
            filled = True
    if not filled:
        # Si el logo toca las cuatro esquinas, no hay fondo que retirar.
        return rgba
    alpha_bbox = rgba.getchannel("A").getbbox()
    return rgba.crop(alpha_bbox) if alpha_bbox else rgba


def make_white(image: Image.Image) -> Image.Image:
    """Pinta de blanco todo píxel opaco, conservando el alfa."""
    white = image.copy()
    pixels = white.load()
    width, height = white.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 0:
                pixels[x, y] = (255, 255, 255, a)
    return white


def find_wave_block(image: Image.Image, threshold: int = 6) -> tuple[int, int, int, int]:
    """Encuentra el primer bloque de contenido (las tres ondas)."""
    rgb = image.convert("RGB")
    width, height = rgb.size
    white = Image.new("RGB", rgb.size, (255, 255, 255))
    diff = ImageChops.difference(rgb, white).convert("L")
    mask = diff.point(lambda value: 255 if value > threshold else 0)
    pixels = mask.load()

    rows = [any(pixels[x, y] for x in range(width)) for y in range(height)]
    first = next((y for y, has in enumerate(rows) if has), None)
    last = next((y for y in range(height - 1, -1, -1) if rows[y]), None)
    if first is None or last is None:
        raise ValueError("No se encontró contenido en el logo.")

    min_gap = max(10, int((last - first + 1) * 0.08))
    runs: list[tuple[int, int]] = []
    run_start = first
    gap_start: int | None = None
    for y in range(first, last + 1):
        if rows[y]:
            if gap_start is not None:
                if y - gap_start >= min_gap:
                    runs.append((run_start, gap_start - 1))
                    run_start = y
                gap_start = None
        elif gap_start is None:
            gap_start = y
    runs.append((run_start, last))

    if len(runs) < 2:
        raise ValueError(
            "No se pudo separar el bloque de ondas del resto del logo. "
            "Revisa que el original sea el lockup vertical con las ondas arriba."
        )

    waves_top, waves_bottom = runs[0]
    xs = [
        x
        for y in range(waves_top, waves_bottom + 1)
        for x in range(width)
        if pixels[x, y]
    ]
    if not xs:
        raise ValueError("El bloque de ondas está vacío.")
    return min(xs), waves_top, max(xs) + 1, waves_bottom + 1


def ratio(size: tuple[int, int]) -> float:
    return size[0] / size[1]


def assert_same_ratio(label: str, size: tuple[int, int], reference: tuple[int, int]) -> None:
    expected = ratio(reference)
    actual = ratio(size)
    deviation = abs(actual / expected - 1)
    print(f"  {label}: {size[0]}x{size[1]} ratio={actual:.6f} (original {expected:.6f}, desviación {deviation:.2%})")
    if deviation > 0.01:
        raise ValueError(f"{label} se desvía más del 1% de la proporción original.")


def main() -> None:
    if not ORIGINAL.exists():
        raise FileNotFoundError(f"No existe el logo original: {ORIGINAL}")

    original = Image.open(ORIGINAL)
    original.load()
    bbox = content_bbox(original)
    content = original.crop(bbox)
    print(f"Original: {original.size[0]}x{original.size[1]} | contenido: {content.size[0]}x{content.size[1]}")

    color = remove_white_background(content)
    color.save(COLOR, "PNG")
    print(f"Color: {COLOR.name} {color.size[0]}x{color.size[1]}")

    white = make_white(color)
    white.save(WHITE, "PNG")
    print(f"Blanco: {WHITE.name} {white.size[0]}x{white.size[1]}")

    waves_box = find_wave_block(content)
    waves = color.crop(waves_box)
    waves_alpha = waves.getchannel("A").getbbox()
    if waves_alpha:
        waves = waves.crop(waves_alpha)
    waves.save(WAVES, "PNG")
    print(f"Ondas: {WAVES.name} {waves.size[0]}x{waves.size[1]}")

    # Lienzo cuadrado con un 12% de aire, centrado.
    side = int(max(waves.size) * 1.12)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(waves, ((side - waves.size[0]) // 2, (side - waves.size[1]) // 2), waves)
    for name, size in FAVICONS.items():
        canvas.resize((size, size), Image.Resampling.LANCZOS).save(PUBLIC / name, "PNG")
        print(f"Favicon: {name} {size}x{size}")

    # Verificación de proporciones.
    print("\nVerificación de proporciones:")
    assert_same_ratio("color", color.size, content.size)
    assert_same_ratio("blanco", white.size, content.size)
    assert_same_ratio("ondas", waves.size, (waves_box[2] - waves_box[0], waves_box[3] - waves_box[1]))

    # Verificación de alfa y color blanco.
    if color.getchannel("A").tobytes() != white.getchannel("A").tobytes():
        raise ValueError("La versión blanca no conserva el alfa del color.")
    white_pixels = white.load()
    for y in range(white.size[1]):
        for x in range(white.size[0]):
            r, g, b, a = white_pixels[x, y]
            if a > 0 and (r, g, b) != (255, 255, 255):
                raise ValueError("La versión blanca contiene píxeles que no son blancos.")
    print("\nOK: alfa y color blanco verificados.")


if __name__ == "__main__":
    main()
