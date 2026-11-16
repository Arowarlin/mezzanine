#!/usr/bin/env python3
"""Genera las ilustraciones SVG del menú de Mezzanine (client/public/menu/).

Son ilustraciones propias, vistas desde arriba, con la paleta de la marca
(fondo pizarra profundo, ondas verde azulado del logo). No son fotos del
restaurante: reemplázalas por fotos reales cuando estén autorizadas, con el
mismo nombre de archivo o desde el panel admin.

Uso:
    python scripts/make_menu_art.py
"""

from __future__ import annotations

import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "client" / "public" / "menu"

W, H = 800, 600

# Paleta
BG_A, BG_B = "#22302f", "#141c1c"
TEAL_A, TEAL_B = "#b7dccf", "#6f9c94"
PLATE, PLATE_RIM = "#fbf9f4", "#ece6da"
GOLD, GOLD_D = "#e0a84a", "#b97a2a"
GREEN, GREEN_D, GREEN_L = "#5e8c3a", "#3e6626", "#8fbf5a"
RED, RED_D = "#c8402f", "#8f2418"
CHERRY = "#8e1b2c"
ONION = "#a35a9c"
CREAM = "#f2ead6"
AVO, AVO_D = "#a7c75a", "#6d8f2c"
TUNA, TUNA_D = "#d9666e", "#5a2a26"
FISH, FISH_D = "#f3e6cf", "#d8b98a"
BREAD, BREAD_D = "#d9a35b", "#9c6a2c"
LEMON = "#f2d24b"
LIME = "#8cbf3f"


class Svg:
    def __init__(self, seed: str) -> None:
        self.parts: list[str] = []
        self.rng = random.Random(seed)

    def add(self, s: str) -> None:
        self.parts.append(s)

    # ---------- primitivas ----------
    def circle(self, cx, cy, r, fill, extra=""):
        self.add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" {extra}/>')

    def ellipse(self, cx, cy, rx, ry, fill, rot=0, extra=""):
        self.add(
            f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}" '
            f'transform="rotate({rot:.1f} {cx:.1f} {cy:.1f})" {extra}/>'
        )

    def rect(self, cx, cy, w, h, fill, rot=0, rx=4, extra=""):
        self.add(
            f'<rect x="{cx - w / 2:.1f}" y="{cy - h / 2:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" '
            f'fill="{fill}" transform="rotate({rot:.1f} {cx:.1f} {cy:.1f})" {extra}/>'
        )

    def path(self, d, fill="none", stroke="none", sw=0, extra=""):
        stroke_attrs = "" if "stroke=" in extra else f'stroke="{stroke}" stroke-width="{sw}" '
        fill_attr = "" if " fill=" in f" {extra}" else f'fill="{fill}" '
        self.add(
            f'<path d="{d}" {fill_attr}{stroke_attrs}'
            f'stroke-linecap="round" stroke-linejoin="round" {extra}/>'
        )

    def shadow(self, cx, cy, r, ry=None):
        self.ellipse(cx + 10, cy + 16, r * 1.02, (ry or r) * 1.0, "#000", extra='opacity=".32" filter="url(#blur)"')

    def plate(self, cx=400, cy=300, r=235):
        self.shadow(cx, cy, r)
        self.circle(cx, cy, r, PLATE_RIM)
        self.circle(cx, cy, r * 0.97, PLATE)
        self.circle(cx, cy, r * 0.74, "url(#plateWell)")
        self.circle(cx, cy, r * 0.74, "none", 'stroke="#e9e2d4" stroke-width="2"')

    def board(self, cx=400, cy=300, w=560, h=380, rot=-6):
        self.add(
            f'<g transform="rotate({rot} {cx} {cy})">'
            f'<rect x="{cx - w / 2 + 12}" y="{cy - h / 2 + 18}" width="{w}" height="{h}" rx="34" fill="#000" opacity=".32" filter="url(#blur)"/>'
            f'<rect x="{cx - w / 2}" y="{cy - h / 2}" width="{w}" height="{h}" rx="34" fill="url(#wood)"/>'
            + "".join(
                f'<path d="M{cx - w / 2 + 30} {cy - h / 2 + 40 + i * 48} q {w / 2} {12 if i % 2 else -10} {w - 60} 0" '
                f'stroke="#7a5230" stroke-opacity=".18" stroke-width="2" fill="none"/>'
                for i in range(7)
            )
            + "</g>"
        )

    def bowl(self, cx, cy, r, fill):
        self.shadow(cx, cy, r)
        self.circle(cx, cy, r, PLATE_RIM)
        self.circle(cx, cy, r * 0.9, "#e3dccd")
        self.circle(cx, cy, r * 0.84, fill)

    def ramekin(self, cx, cy, r, fill, rim="#2b3a3a"):
        self.shadow(cx, cy, r)
        self.circle(cx, cy, r, rim)
        self.circle(cx, cy, r * 0.82, fill)
        self.ellipse(cx - r * 0.3, cy - r * 0.35, r * 0.25, r * 0.12, "#fff", -30, 'opacity=".25"')

    # ---------- dispersión ----------
    def pts(self, cx, cy, r, n, min_d=0.0):
        out = []
        tries = 0
        while len(out) < n and tries < n * 60:
            tries += 1
            a = self.rng.uniform(0, math.tau)
            d = r * math.sqrt(self.rng.random())
            p = (cx + d * math.cos(a), cy + d * math.sin(a))
            if all(math.dist(p, q) >= min_d for q in out):
                out.append(p)
        return out

    def herbs(self, cx, cy, r, n=14, color=GREEN, size=7):
        for x, y in self.pts(cx, cy, r, n):
            rot = self.rng.uniform(0, 180)
            self.ellipse(x, y, size, size * 0.55, color, rot)
            self.ellipse(x + 4, y - 3, size * 0.8, size * 0.45, GREEN_L, rot + 50, 'opacity=".9"')

    def microgreens(self, cx, cy, r, n=10):
        for x, y in self.pts(cx, cy, r, n):
            a = self.rng.uniform(0, math.tau)
            ex, ey = x + 16 * math.cos(a), y + 16 * math.sin(a)
            self.path(f"M{x:.1f} {y:.1f} L{ex:.1f} {ey:.1f}", stroke="#c9e3a6", sw=2)
            self.ellipse(ex, ey, 6, 3.5, GREEN_L, math.degrees(a) + 90)
            self.ellipse(ex, ey, 6, 3.5, GREEN, math.degrees(a) + 20, 'opacity=".8"')

    def drizzle(self, cx, cy, w, h, color, sw=5, loops=4):
        d = f"M{cx - w / 2:.1f} {cy:.1f}"
        for i in range(loops):
            x = cx - w / 2 + (i + 0.5) * w / loops
            d += f" Q {x:.1f} {cy + (h if i % 2 else -h):.1f} {x + w / loops / 2:.1f} {cy:.1f}"
        self.path(d, stroke=color, sw=sw, extra='opacity=".92"')

    def dice(self, cx, cy, r, n, colors, size=14):
        for x, y in self.pts(cx, cy, r, n, size * 0.9):
            self.rect(x, y, size, size * self.rng.uniform(0.8, 1.1), self.rng.choice(colors), self.rng.uniform(0, 90), rx=3)

    def seeds(self, cx, cy, r, n, color="#f6efe0"):
        for x, y in self.pts(cx, cy, r, n):
            self.ellipse(x, y, 2.6, 1.5, color, self.rng.uniform(0, 180))

    def chips(self, cx, cy, r, n, colors=("#e8c46a", "#d9ad54", "#c9a27a")):
        for x, y in self.pts(cx, cy, r, n, 18):
            c = self.rng.choice(colors)
            rr = self.rng.uniform(22, 30)
            rot = self.rng.uniform(0, 360)
            self.path(
                f"M{x - rr:.1f} {y:.1f} A {rr:.1f} {rr:.1f} 0 0 1 {x + rr:.1f} {y:.1f} Z",
                fill=c,
                extra=f'transform="rotate({rot:.1f} {x:.1f} {y:.1f})" stroke="#a9813b" stroke-opacity=".35" stroke-width="1.5"',
            )

    def lemon(self, cx, cy, r, rot=0, color=LEMON):
        self.add(f'<g transform="rotate({rot} {cx} {cy})">')
        self.path(f"M{cx - r} {cy} A {r} {r} 0 0 1 {cx + r} {cy} Z", fill=color)
        self.path(f"M{cx - r * 0.82} {cy} A {r * 0.82} {r * 0.82} 0 0 1 {cx + r * 0.82} {cy} Z", fill="#fff6c9" if color == LEMON else "#d7ef9c")
        for k in range(1, 4):
            a = math.pi * k / 4
            self.path(f"M{cx} {cy} L{cx - r * 0.8 * math.cos(a):.1f} {cy - r * 0.8 * math.sin(a):.1f}", stroke=color, sw=2)
        self.add("</g>")

    def fries(self, cx, cy, r, n=16):
        for x, y in self.pts(cx, cy, r, n):
            self.rect(x, y, 14, self.rng.uniform(60, 90), self.rng.choice(["#f0c45a", "#e6b44a", "#f5cf6b"]), self.rng.uniform(0, 180), rx=4,
                      extra='stroke="#c48b2a" stroke-opacity=".4" stroke-width="1.5"')

    def asparagus(self, cx, cy, n=5, rot=0, length=170):
        self.add(f'<g transform="rotate({rot} {cx} {cy})">')
        for i in range(n):
            y = cy + (i - n / 2) * 15
            self.rect(cx, y, length, 11, "#6f9a3a", rx=5)
            self.ellipse(cx + length / 2, y, 14, 8, "#567a2c")
            for k in range(3):
                self.ellipse(cx + length / 2 - 30 - k * 30, y, 6, 4, "#86ad4c")
            self.seeds(cx, y, 20, 4, "#efe6c8")
        self.add("</g>")

    def mash(self, cx, cy, r):
        self.circle(cx, cy, r, "#efe1b8")
        for k in range(4):
            self.path(
                f"M{cx - r * 0.7:.1f} {cy - r * 0.4 + k * r * 0.28:.1f} q {r * 0.7:.1f} {-r * 0.25:.1f} {r * 1.4:.1f} 0",
                stroke="#dcc790", sw=4,
            )
        self.circle(cx + r * 0.2, cy - r * 0.2, r * 0.18, "#f7d77a", 'opacity=".8"')
        self.seeds(cx, cy, r * 0.8, 8, GREEN_D)

    def shrimp(self, x, y, s=1.0, rot=0):
        self.add(f'<g transform="translate({x} {y}) rotate({rot}) scale({s})">')
        self.path("M-28 6 A 30 30 0 1 1 26 10 L 14 12 A 16 16 0 1 0 -14 8 Z", fill="#e9a54a", stroke="#b8742a", sw=2)
        for k in range(4):
            a = math.pi * (1.05 + k * 0.22)
            self.path(f"M{22 * math.cos(a):.1f} {22 * math.sin(a) + 6:.1f} L{30 * math.cos(a):.1f} {30 * math.sin(a) + 6:.1f}", stroke="#c98535", sw=2)
        self.add("</g>")

    def tortilla(self, cx, cy, r, rot, filling):
        self.add(f'<g transform="rotate({rot} {cx} {cy})">')
        self.path(f"M{cx - r} {cy} A {r} {r * 0.75} 0 0 0 {cx + r} {cy} Z", fill="#f1d9a2", stroke="#cfa964", sw=3)
        filling(cx, cy - 4, r)
        self.add("</g>")

    def slaw(self, cx, cy, w, n=16):
        for _ in range(n):
            x = cx + self.rng.uniform(-w / 2, w / 2)
            y = cy + self.rng.uniform(-10, 6)
            c = self.rng.choice(["#b44b7a", "#d06a8e", "#f0e0a8", "#9cc25a"])
            self.rect(x, y, self.rng.uniform(20, 34), 4, c, self.rng.uniform(-30, 30), rx=2)

    def svg(self) -> str:
        defs = f"""
<defs>
  <radialGradient id="bg" cx="38%" cy="32%" r="85%">
    <stop offset="0" stop-color="{BG_A}"/><stop offset="1" stop-color="{BG_B}"/>
  </radialGradient>
  <radialGradient id="plateWell" cx="45%" cy="40%" r="70%">
    <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f1ece2"/>
  </radialGradient>
  <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#b98a5a"/><stop offset="1" stop-color="#8f6237"/>
  </linearGradient>
  <linearGradient id="wave" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="{TEAL_A}"/><stop offset="1" stop-color="{TEAL_B}"/>
  </linearGradient>
  <filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
</defs>"""
        waves = "".join(
            f'<path d="M{W - 210} {H - 92 + i * 26} c 30 -18 55 -18 80 0 s 50 18 80 0 s 45 -16 64 -6" '
            f'stroke="url(#wave)" stroke-width="9" fill="none" stroke-linecap="round" opacity=".22"/>'
            for i in range(3)
        )
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img">'
            + defs
            + f'<rect width="{W}" height="{H}" fill="url(#bg)"/>'
            + waves
            + "".join(self.parts)
            + "</svg>"
        )


# ======================= PLATOS =======================


def ceviche(s: Svg):
    s.bowl(360, 300, 190, "#f5efe2")
    s.circle(360, 300, 150, "#f7e9d6")
    s.dice(360, 300, 125, 26, [FISH, "#fff8ec", FISH], 22)
    s.dice(360, 300, 125, 14, [RED, "#e05a3e"], 13)
    s.dice(360, 300, 120, 10, [ONION], 10)
    s.drizzle(360, 300, 180, 26, AVO, 6, 5)
    s.microgreens(360, 300, 110, 9)
    s.chips(640, 320, 90, 7)
    s.lemon(610, 140, 34, 30, LIME)


def poke(s: Svg):
    s.bowl(360, 300, 190, "#2b2b2e")
    s.circle(360, 300, 150, "#3a2a2a")
    s.dice(360, 300, 120, 30, [TUNA, "#c9505a", "#e07a80"], 26)
    s.drizzle(360, 290, 170, 22, "#cfe39b", 6, 5)
    for x, y in s.pts(360, 300, 115, 14):
        s.circle(x, y, 7, "none", f'stroke="{GREEN_L}" stroke-width="3"')
    s.seeds(360, 300, 125, 40)
    s.seeds(360, 300, 120, 18, "#2a2420")
    s.chips(640, 330, 90, 7)


def cheese_curds(s: Svg):
    s.plate(380, 300, 230)
    for x, y in s.pts(360, 310, 140, 26, 34):
        r = s.rng.uniform(22, 30)
        s.ellipse(x, y, r, r * 0.82, s.rng.choice([GOLD, "#e8b65a", "#d9993c"]), s.rng.uniform(0, 180),
                  'stroke="#a8702a" stroke-opacity=".35" stroke-width="2"')
        s.ellipse(x - 6, y - 6, r * 0.35, r * 0.2, "#fbe3a6", 0, 'opacity=".6"')
    s.ramekin(560, 170, 52, CHERRY)
    s.ramekin(570, 420, 46, "#f1ece0")
    s.seeds(570, 420, 25, 10, GREEN_D)


def chili_lime_fries(s: Svg):
    s.plate(390, 300, 235)
    s.fries(390, 300, 130, 26)
    for x, y in s.pts(390, 300, 130, 40):
        s.circle(x, y, 2.5, RED_D)
    s.drizzle(390, 300, 210, 24, CREAM, 7, 6)
    for x, y in s.pts(390, 300, 120, 16):
        s.circle(x, y, 6, "none", f'stroke="{GREEN_L}" stroke-width="3"')
    s.seeds(390, 300, 120, 30, "#fff4d6")
    s.lemon(570, 150, 34, 20, LIME)


def guacamole(s: Svg):
    s.bowl(350, 300, 165, AVO)
    for x, y in s.pts(350, 300, 120, 22):
        s.circle(x, y, s.rng.uniform(6, 12), s.rng.choice([AVO_D, "#c1d97a", "#93b94a"]))
    s.dice(350, 300, 90, 6, [RED], 10)
    s.herbs(350, 300, 80, 6)
    for x, y in s.pts(600, 300, 120, 9, 30):
        rot = s.rng.uniform(0, 360)
        s.path(f"M{x} {y - 30} L{x + 28} {y + 20} L{x - 28} {y + 20} Z", fill="#e9c672", extra=f'transform="rotate({rot:.0f} {x:.0f} {y:.0f})" stroke="#c7a04e" stroke-width="2"')
        s.seeds(x, y, 14, 3, RED_D)
    s.lemon(560, 120, 32, 200, LIME)


def chimichurri_bread(s: Svg):
    s.board(400, 300, 600, 380, -5)
    for i, (x, y) in enumerate([(300, 240), (430, 300), (300, 380)]):
        s.ellipse(x, y, 110, 58, BREAD, -12, 'stroke="#8a5a24" stroke-width="3"')
        s.ellipse(x, y, 92, 44, "#f0d6a2", -12)
        for k in range(4):
            s.rect(x - 50 + k * 34, y, 10, 70, "#4a2e16", -50, rx=5, extra='opacity=".65"')
    s.ramekin(590, 220, 64, "#4f7a2a")
    s.herbs(590, 220, 42, 14, "#6f9a3a", 6)
    for x, y in s.pts(590, 220, 40, 10):
        s.circle(x, y, 2.5, RED)


def whitefish_cakes(s: Svg):
    s.plate(400, 300, 235)
    for x, y in [(330, 250), (470, 260), (400, 370)]:
        s.circle(x, y, 66, "#c98a3c")
        s.circle(x, y, 58, "#dda457")
        for px, py in s.pts(x, y, 50, 14):
            s.circle(px, py, 3, "#b4762e")
        s.drizzle(x, y - 6, 80, 12, "#e9944a", 5, 3)
        s.drizzle(x, y + 12, 70, 10, "#cfe39b", 5, 3)
    s.microgreens(400, 300, 90, 10)
    s.rect(440, 450, 70, 18, "#f08a7a", 20, rx=8)


def mussels(s: Svg):
    s.bowl(370, 300, 200, "#e9d9a8")
    for x, y in s.pts(370, 300, 140, 16, 42):
        rot = s.rng.uniform(0, 360)
        s.add(f'<g transform="rotate({rot:.0f} {x:.0f} {y:.0f})">')
        s.ellipse(x, y, 36, 22, "#1f2433")
        s.ellipse(x + 2, y, 28, 15, "#e58a3c")
        s.ellipse(x - 4, y - 2, 10, 5, "#f6b46c")
        s.add("</g>")
    s.herbs(370, 300, 150, 20, "#4f7a2a", 6)
    s.seeds(370, 300, 150, 16, "#f3e3a6")
    s.ellipse(640, 330, 70, 110, BREAD, 15, 'stroke="#8a5a24" stroke-width="3"')
    s.ellipse(640, 330, 56, 94, "#f0d6a2", 15)
    s.lemon(620, 120, 32, 25)


def taco_fish(color, crust=None):
    def fill(s: Svg, cx, cy, r):
        s.slaw(cx, cy - r * 0.18, r * 1.3, 18)
        for k in range(3):
            s.rect(cx - r * 0.5 + k * r * 0.5, cy - r * 0.02, r * 0.42, r * 0.22, color, s.rng.uniform(-15, 15), rx=6,
                   extra=f'stroke="{crust or color}" stroke-width="3"')
        s.herbs(cx, cy - r * 0.15, r * 0.5, 6, GREEN, 5)
    return fill


def tacos(s: Svg, fish_color, crust):
    s.plate(400, 300, 240)
    for i, (x, y, rot) in enumerate([(320, 220, -20), (420, 300, -20), (520, 380, -20)]):
        s.tortilla(x, y, 95, rot, lambda cx, cy, r: taco_fish(fish_color, crust)(s, cx, cy, r))
    s.lemon(240, 410, 34, 160, LIME)


def ahi_tuna_tacos(s: Svg):
    tacos(s, TUNA, TUNA_D)
    s.seeds(420, 290, 160, 26)


def whitefish_tacos(s: Svg):
    tacos(s, "#e2b064", "#c8893a")


def wrap(s: Svg, inner):
    s.plate(380, 300, 235)
    for (x, y, rot) in [(310, 300, -15), (460, 290, 12)]:
        s.add(f'<g transform="rotate({rot} {x} {y})">')
        s.rect(x, y, 130, 190, "#f1dcae", 0, rx=26, extra='stroke="#cfa964" stroke-width="3"')
        s.ellipse(x, y - 95, 65, 30, "#f6e8c6", 0, 'stroke="#cfa964" stroke-width="3"')
        inner(x, y - 95)
        s.add("</g>")
    s.fries(610, 330, 70, 9)


def shrimp_wrap(s: Svg):
    def inner(x, y):
        s.ellipse(x, y, 52, 22, "#9cc25a")
        s.ellipse(x, y, 40, 16, "#b44b7a")
        s.ellipse(x - 10, y, 18, 10, "#e9a54a")
        s.ellipse(x + 16, y + 2, 12, 8, AVO)
    wrap(s, inner)
    s.shrimp(250, 150, 0.9, 20)


def blta_wrap(s: Svg):
    def inner(x, y):
        s.ellipse(x, y, 52, 22, "#9cc25a")
        s.ellipse(x - 12, y, 18, 12, RED)
        s.ellipse(x + 14, y, 20, 12, "#a0412f")
        s.ellipse(x + 2, y + 4, 10, 7, AVO)
    wrap(s, inner)


def burger(s: Svg):
    s.board(400, 310, 600, 360, -4)
    cx, cy = 350, 300
    s.shadow(cx, cy + 30, 170, 60)
    s.ellipse(cx, cy + 110, 150, 34, "#d39b55")
    s.ellipse(cx, cy + 80, 165, 30, "#5a3a24")
    s.ellipse(cx, cy + 66, 160, 26, "#f2b33a")
    s.ellipse(cx, cy + 50, 168, 22, "#9cc25a")
    s.ellipse(cx, cy + 38, 150, 18, RED)
    s.ellipse(cx, cy + 26, 150, 16, AVO)
    s.path(f"M{cx - 160} {cy + 20} C {cx - 160} {cy - 140} {cx + 160} {cy - 140} {cx + 160} {cy + 20} Z", fill="#d99a4e",
           stroke="#a8692a", sw=3)
    s.ellipse(cx - 40, cy - 60, 60, 20, "#efc07a", -10, 'opacity=".55"')
    s.seeds(cx, cy - 50, 90, 22)
    s.fries(590, 300, 80, 12)


def whitefish_fillet(s: Svg, x, y, rot, fried=True):
    s.add(f'<g transform="rotate({rot} {x} {y})">')
    s.path(f"M{x - 110} {y} C {x - 80} {y - 50} {x + 70} {y - 46} {x + 110} {y - 6} C {x + 70} {y + 44} {x - 80} {y + 48} {x - 110} {y} Z",
           fill="#dca452" if fried else "#e9c88a", stroke="#a8702a", sw=3)
    for px, py in s.pts(x, y, 40, 22 if fried else 0):
        s.circle(px, py, 3, "#b97a32")
    if not fried:
        for k in range(5):
            s.path(f"M{x - 70 + k * 30} {y - 30} q 10 30 0 60", stroke="#c99a52", sw=3)
    s.add("</g>")


def whitefish_basket(s: Svg):
    s.add('<rect x="150" y="80" width="500" height="440" rx="40" fill="#000" opacity=".3" filter="url(#blur)"/>')
    s.add('<rect x="140" y="70" width="500" height="440" rx="40" fill="#2a2f33"/>')
    s.add('<rect x="160" y="90" width="460" height="400" rx="30" fill="#f4ecd8"/>')
    for i in range(8):
        s.add(f'<path d="M{160 + i * 60} 90 L{160 + i * 60} 490" stroke="#e2d6bb" stroke-width="2"/>')
    whitefish_fillet(s, 320, 210, -12)
    whitefish_fillet(s, 330, 330, 8)
    s.fries(500, 360, 80, 12)
    s.ramekin(520, 170, 44, "#f1ece0")
    s.seeds(520, 170, 22, 10, GREEN_D)
    s.slaw(300, 440, 140, 18)
    s.lemon(560, 450, 30, 10)


def whitefish_sandwich(s: Svg):
    s.board(400, 310, 600, 360, 4)
    cx, cy = 340, 300
    s.shadow(cx, cy, 170, 70)
    s.path(f"M{cx - 170} {cy + 30} C {cx - 160} {cy + 90} {cx + 160} {cy + 90} {cx + 170} {cy + 30} Z", fill="#d99a4e", stroke="#a8692a", sw=3)
    s.ellipse(cx, cy + 22, 172, 26, "#9cc25a")
    s.ellipse(cx, cy + 6, 160, 30, "#dca452", 0, 'stroke="#a8702a" stroke-width="3"')
    s.ellipse(cx, cy - 12, 150, 14, "#f4f0e2")
    for px, py in s.pts(cx, cy - 18, 90, 14):
        s.rect(px, py, 18, 3, "#e9f2c8", s.rng.uniform(0, 180), rx=2)
    s.path(f"M{cx - 160} {cy - 20} C {cx - 150} {cy - 140} {cx + 150} {cy - 140} {cx + 160} {cy - 20} Z", fill="#d99a4e", stroke="#a8692a", sw=3)
    s.ellipse(cx - 40, cy - 80, 60, 18, "#efc07a", -8, 'opacity=".55"')
    s.lemon(570, 230, 36, 15)
    s.fries(580, 380, 70, 9)


def capellini(s: Svg, with_mussels=False):
    s.bowl(390, 300, 215, "#f3ead2")
    for k in range(34):
        a0 = s.rng.uniform(0, math.tau)
        r0 = s.rng.uniform(20, 140)
        pts = []
        for t in range(9):
            a = a0 + t * 0.45
            r = r0 + 12 * math.sin(t * 1.3 + k)
            pts.append((390 + r * math.cos(a), 300 + r * math.sin(a) * 0.95))
        d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f} " + " ".join(f"L{x:.1f} {y:.1f}" for x, y in pts[1:])
        s.path(d, stroke=s.rng.choice(["#ecd394", "#e3c47d", "#f1dca6"]), sw=4)
    for x, y in s.pts(390, 300, 140, 30):
        s.circle(x, y, 2.6, RED)
    for x, y in s.pts(390, 300, 150, 18):
        s.circle(x, y, s.rng.uniform(3, 7), "#5c8a2c", 'opacity=".85"')
    s.seeds(390, 300, 120, 30, "#fff7df")
    if with_mussels:
        for x, y in s.pts(390, 300, 150, 7, 70):
            rot = s.rng.uniform(0, 360)
            s.add(f'<g transform="rotate({rot:.0f} {x:.0f} {y:.0f})">')
            s.ellipse(x, y, 34, 20, "#1f2433")
            s.ellipse(x + 2, y, 26, 14, "#e58a3c")
            s.add("</g>")
    s.herbs(390, 230, 40, 4, "#4f8a2a", 10)


def baja_ahi_tuna(s: Svg):
    s.plate(400, 300, 240)
    for k in range(26):
        a0 = s.rng.uniform(0, math.tau)
        r = s.rng.uniform(20, 70)
        s.path(f"M{300 + r * math.cos(a0):.0f} {320 + r * math.sin(a0):.0f} q 30 -40 70 -10 t 60 20",
               stroke=s.rng.choice(["#efe6cf", "#e6dab8"]), sw=4)
    for i in range(6):
        x, y = 400 + i * 30, 230 + i * 22
        s.add(f'<g transform="rotate(-35 {x} {y})">')
        s.rect(x, y, 34, 92, TUNA_D, 0, rx=8)
        s.rect(x, y, 22, 82, TUNA, 0, rx=6)
        s.add("</g>")
    s.seeds(470, 290, 80, 24)
    for x, y in s.pts(320, 300, 60, 12):
        s.circle(x, y, 4, RED)
    s.drizzle(330, 380, 120, 14, "#cfe39b", 6, 4)
    s.microgreens(470, 280, 60, 6)
    s.lemon(580, 420, 34, 210, LIME)
    s.lemon(240, 190, 30, 30, LIME)


def skirt_steak(s: Svg):
    s.plate(400, 300, 240)
    s.mash(320, 330, 75)
    s.asparagus(440, 420, 5, -10, 190)
    for i in range(6):
        x, y = 380 + i * 34, 190 + i * 14
        s.add(f'<g transform="rotate(20 {x} {y})">')
        s.rect(x, y, 40, 110, "#5a2e22", 0, rx=10)
        s.rect(x, y, 26, 96, "#c6555a", 0, rx=8)
        s.rect(x, y, 14, 84, "#e07c7c", 0, rx=6)
        s.add("</g>")
    s.herbs(470, 230, 70, 16, "#4f7a2a", 7)
    for x, y in s.pts(470, 230, 70, 10):
        s.circle(x, y, 2.5, RED)
    s.rect(260, 190, 120, 60, BREAD, -20, rx=12, extra='stroke="#8a5a24" stroke-width="3"')
    s.herbs(260, 190, 30, 6, "#4f7a2a", 5)


def cherry_salad(s: Svg):
    s.bowl(400, 300, 220, "#e9f0d8")
    for x, y in s.pts(400, 300, 165, 46, 16):
        s.ellipse(x, y, s.rng.uniform(16, 26), s.rng.uniform(9, 14), s.rng.choice([GREEN, "#7aa84a", "#4e7d34", "#a4c96a", "#6b3a5a"]),
                  s.rng.uniform(0, 180))
    for x, y in s.pts(400, 300, 150, 14):
        s.circle(x, y, 8, CHERRY)
    for x, y in s.pts(400, 300, 150, 8):
        s.circle(x, y, 9, "#3b3f8f")
    for x, y in s.pts(400, 300, 150, 7):
        s.circle(x, y, 9, "#d43a4a")
    for x, y in s.pts(400, 300, 140, 6):
        s.ellipse(x, y, 20, 9, "#f2933a", s.rng.uniform(0, 180))
    for x, y in s.pts(400, 300, 150, 12):
        s.ellipse(x, y, 9, 5, "#d6b383", s.rng.uniform(0, 180), 'stroke="#b08a56" stroke-width="1.5"')
    for x, y in s.pts(400, 300, 140, 8):
        s.path(f"M{x - 14:.0f} {y:.0f} q 14 -14 28 0", stroke=ONION, sw=4)


def smash_salad(s: Svg):
    s.bowl(400, 300, 220, "#e9f0d8")
    for x, y in s.pts(400, 300, 165, 40, 18):
        s.ellipse(x, y, s.rng.uniform(16, 26), s.rng.uniform(9, 14), s.rng.choice([GREEN, "#7aa84a", "#a4c96a"]), s.rng.uniform(0, 180))
    s.dice(400, 300, 130, 16, [AVO, "#bcd46c"], 24)
    for x, y in s.pts(400, 300, 140, 8):
        s.rect(x, y, 60, 14, "#a0412f", s.rng.uniform(0, 180), rx=5, extra='stroke="#f0c0a0" stroke-width="2"')
    for x, y in s.pts(400, 300, 140, 8):
        s.path(f"M{x - 14:.0f} {y:.0f} q 14 -14 28 0", stroke=ONION, sw=4)
    for x, y in s.pts(400, 300, 150, 30):
        s.circle(x, y, 2.5, RED)
    s.seeds(400, 300, 150, 30, "#fff5d8")


def soup(s: Svg):
    s.bowl(380, 300, 200, "#e9c98c")
    s.circle(380, 300, 160, "#efd29a")
    s.path("M300 300 C 300 220 460 220 460 300 C 460 360 360 360 360 310", stroke="#fbf1d6", sw=8)
    s.herbs(380, 300, 70, 10, GREEN, 6)
    for x, y in s.pts(380, 300, 120, 18):
        s.circle(x, y, 3, "#c58b3b")
    s.ellipse(640, 330, 60, 95, BREAD, 15, 'stroke="#8a5a24" stroke-width="3"')
    s.ellipse(640, 330, 46, 80, "#f0d6a2", 15)


def guajillo_salmon(s: Svg):
    s.plate(400, 300, 240)
    s.circle(360, 320, 110, "#f6f2e6")
    for x, y in s.pts(360, 320, 95, 60):
        s.ellipse(x, y, 5, 2.5, "#fffdf4", s.rng.uniform(0, 180))
    s.herbs(360, 320, 90, 10, GREEN, 4)
    s.drizzle(300, 420, 160, 12, "#7aa84a", 8, 4)
    s.add('<g transform="rotate(-18 420 270)">')
    s.rect(420, 270, 220, 110, "#d8643a", 0, rx=30, extra='stroke="#a8401f" stroke-width="3"')
    for k in range(6):
        s.path(f"M{330 + k * 34} 225 q 14 45 0 90", stroke="#f7a77a", sw=5)
    for k in range(4):
        s.rect(370 + k * 34, 270, 10, 100, "#7a2a14", 0, rx=4, extra='opacity=".55"')
    s.add("</g>")
    s.dice(440, 250, 55, 14, ["#f4b23a", "#f7c95a", "#e98b2a"], 14)
    for x, y in s.pts(440, 250, 50, 10):
        s.circle(x, y, 5, "none", f'stroke="{GREEN_L}" stroke-width="3"')
    s.drizzle(430, 300, 110, 10, "#cfe39b", 5, 3)


def center_cut_chop(s: Svg):
    s.plate(400, 300, 240)
    s.mash(320, 340, 80)
    s.asparagus(450, 440, 5, -8, 180)
    for x, y in [(420, 220), (520, 260), (450, 320)]:
        s.ellipse(x, y, 74, 54, "#c98a3c", s.rng.uniform(-20, 20), 'stroke="#8a5a24" stroke-width="3"')
        s.ellipse(x, y, 62, 44, "#dda457", 0)
        for px, py in s.pts(x, y, 44, 16):
            s.circle(px, py, 3, "#b4762e")
    s.dice(470, 250, 50, 12, ["#f4b23a", RED, "#9cc25a"], 11)


def whitefish_platter(s: Svg):
    s.plate(400, 300, 240)
    s.mash(310, 230, 70)
    s.asparagus(320, 400, 5, 20, 170)
    whitefish_fillet(s, 470, 280, 30, fried=False)
    s.herbs(470, 280, 50, 6, GREEN, 4)
    s.rect(560, 420, 60, 40, BREAD, -15, rx=10, extra='stroke="#8a5a24" stroke-width="3"')
    s.ramekin(250, 340, 38, "#f1ece0")
    s.lemon(560, 160, 32, 30)
    s.lemon(610, 220, 30, 60)


def lavender_flan(s: Svg):
    s.plate(400, 300, 230)
    s.path("M400 460 C 300 460 300 430 300 420", stroke="#9a5a1a", sw=0)
    s.circle(400, 300, 130, "#b8681f", 'opacity=".55"')
    s.circle(400, 300, 112, "#e9b85a")
    s.circle(400, 300, 92, "#f3cd72")
    s.circle(400, 300, 70, "#c27a2a", 'opacity=".55"')
    s.ellipse(370, 270, 40, 16, "#fff1c4", -30, 'opacity=".6"')
    for k in range(7):
        s.ellipse(520 + k * 9, 170 - k * 12, 7, 5, "#9b7ad1", 20)
        s.ellipse(527 + k * 9, 176 - k * 12, 6, 4, "#b79be6", 50)
    s.path("M505 190 L 590 90", stroke="#6f8a4a", sw=3)


def cherry_crisp(s: Svg):
    s.ramekin(380, 300, 170, "#7d1424", "#efe9dc")
    for x, y in s.pts(380, 300, 120, 30):
        s.circle(x, y, s.rng.uniform(10, 16), s.rng.choice([CHERRY, "#a3243a", "#6a0f1d"]))
    for x, y in s.pts(380, 300, 125, 46, 12):
        s.ellipse(x, y, s.rng.uniform(9, 15), s.rng.uniform(7, 11), s.rng.choice(["#d9a35b", "#c98d48", "#e7b979"]), s.rng.uniform(0, 180))
    s.circle(440, 250, 58, "#f4e6c8")
    s.circle(440, 250, 50, "#f8eed6")
    for x, y in s.pts(440, 250, 40, 12):
        s.circle(x, y, 2.5, "#b07a3a")
    s.drizzle(440, 248, 70, 10, "#c98d48", 4, 3)
    s.add('<path d="M600 470 l 60 -260" stroke="#c0c4c4" stroke-width="10" stroke-linecap="round"/>')
    s.ellipse(668, 190, 22, 34, "#c0c4c4", 12)


# ===================== CATEGORÍAS =====================


def composite(*fns):
    """Varias miniaturas en una sola composición."""
    def draw(s: Svg):
        positions = [(0.40, 0.42, 0.62), (0.80, 0.30, 0.42), (0.78, 0.80, 0.42)]
        for fn, (fx, fy, sc) in zip(fns, positions):
            cx, cy = W * fx, H * fy
            sub = Svg(fn.__name__)
            sub.no_bar = True
            fn(sub)
            s.add(
                f'<g transform="translate({cx - W / 2 * sc:.1f} {cy - H / 2 * sc:.1f}) scale({sc})">'
                + "".join(sub.parts)
                + "</g>"
            )
    return draw


DISHES = {
    "ceviche": ceviche,
    "poke": poke,
    "cheese-curds": cheese_curds,
    "chili-lime-fries": chili_lime_fries,
    "guacamole": guacamole,
    "chimichurri-bread": chimichurri_bread,
    "whitefish-cakes": whitefish_cakes,
    "mussels": mussels,
    "ahi-tuna-tacos": ahi_tuna_tacos,
    "whitefish-tacos": whitefish_tacos,
    "shrimp-wrap": shrimp_wrap,
    "blta-wrap": blta_wrap,
    "burger": burger,
    "whitefish-basket": whitefish_basket,
    "whitefish-sandwich": whitefish_sandwich,
    "capellini": capellini,
    "capellini-mussels": lambda s: capellini(s, True),
    "baja-ahi-tuna": baja_ahi_tuna,
    "skirt-steak": skirt_steak,
    "cherry-salad": cherry_salad,
    "smash-salad": smash_salad,
    "soup": soup,
    "guajillo-salmon": guajillo_salmon,
    "center-cut-chop": center_cut_chop,
    "whitefish-platter": whitefish_platter,
    "lavender-flan": lavender_flan,
    "cherry-crisp": cherry_crisp,
    "category-appetizers": composite(ceviche, cheese_curds, poke),
    "category-lunch": composite(whitefish_tacos, burger, whitefish_sandwich),
    "category-dinner": composite(skirt_steak, guajillo_salmon, baja_ahi_tuna),
    "category-salads": composite(cherry_salad, soup, smash_salad),
    "category-desserts": composite(cherry_crisp, lavender_flan, cherry_crisp),
}


# ======================= BEBIDAS =======================
# Vista lateral sobre una barra; vidrio translúcido, líquido con color.

GLASS = 'fill="#ffffff" fill-opacity=".10" stroke="#e8f2ef" stroke-opacity=".55" stroke-width="3"'


def bar_top(s: Svg):
    if getattr(s, "no_bar", False):
        return
    s.add('<rect x="0" y="470" width="800" height="130" fill="#0e1414" opacity=".55"/>')
    s.add('<rect x="0" y="468" width="800" height="3" fill="#e8f2ef" opacity=".08"/>')


def glass_shadow(s: Svg, cx, w):
    s.ellipse(cx, 478, w, 10, "#000", 0, 'opacity=".45" filter="url(#blur)"')


def lime_wheel(s: Svg, x, y, r=28, color=LIME, rot=0):
    s.add(f'<g transform="rotate({rot} {x} {y})">')
    s.circle(x, y, r, color)
    s.circle(x, y, r * 0.84, "#e4f3b8" if color == LIME else "#fff5c4")
    for k in range(8):
        a = math.tau * k / 8
        s.path(f"M{x} {y} L{x + r * 0.8 * math.cos(a):.1f} {y + r * 0.8 * math.sin(a):.1f}", stroke=color, sw=2)
    s.add("</g>")


def ice(s: Svg, x0, y0, x1, y1, n=4):
    for x, y in s.pts((x0 + x1) / 2, (y0 + y1) / 2, min(x1 - x0, y1 - y0) / 2.4, n, 34):
        s.rect(x, y, 44, 40, "#ffffff", s.rng.uniform(-14, 14), rx=8, extra='fill-opacity=".22" stroke="#ffffff" stroke-opacity=".45" stroke-width="2"')


def bubbles(s: Svg, x0, y0, x1, y1, n=18):
    for _ in range(n):
        s.circle(s.rng.uniform(x0, x1), s.rng.uniform(y0, y1), s.rng.uniform(2, 4.5), "none", 'stroke="#ffffff" stroke-opacity=".55" stroke-width="1.5"')


def leaf(s: Svg, x, y, size, rot, color=GREEN):
    s.ellipse(x, y, size, size * 0.45, color, rot)
    s.path(f"M{x - size * math.cos(math.radians(rot)) * 0.8:.1f} {y - size * math.sin(math.radians(rot)) * 0.8:.1f} "
           f"L{x + size * math.cos(math.radians(rot)) * 0.8:.1f} {y + size * math.sin(math.radians(rot)) * 0.8:.1f}",
           stroke=GREEN_D, sw=1.5)


def lavender_sprig(s: Svg, x, y, length=120, rot=-15):
    s.add(f'<g transform="rotate({rot} {x} {y})">')
    s.path(f"M{x} {y} L{x} {y - length}", stroke="#6f8a4a", sw=3)
    for k in range(9):
        yy = y - length + k * 10
        s.ellipse(x - 5, yy, 6, 4, "#9b7ad1", -30)
        s.ellipse(x + 5, yy + 4, 6, 4, "#b79be6", 30)
    s.add("</g>")


def coupe(s: Svg, liquid, rim=None, cx=400):
    """Copa ancha (margarita)."""
    bar_top(s)
    glass_shadow(s, cx, 110)
    s.path(f"M{cx - 150} 170 C {cx - 140} 300 {cx + 140} 300 {cx + 150} 170 Z", fill=liquid, extra='opacity=".92"')
    s.path(f"M{cx - 150} 170 C {cx - 140} 300 {cx + 140} 300 {cx + 150} 170", extra=GLASS)
    s.ellipse(cx, 172, 150, 18, liquid, 0, 'opacity=".95"')
    s.ellipse(cx, 168, 150, 18, "none", 0, 'stroke="#e8f2ef" stroke-opacity=".6" stroke-width="3"')
    if rim:
        for k in range(46):
            a = math.tau * k / 46
            s.circle(cx + 150 * math.cos(a), 168 + 18 * math.sin(a), 3.2, rim)
    s.rect(cx, 365, 14, 140, "#e8f2ef", 0, rx=6, extra='opacity=".45"')
    s.ellipse(cx, 465, 95, 14, "#e8f2ef", 0, 'opacity=".4"')
    s.ellipse(cx - 70, 215, 40, 10, "#fff", -12, 'opacity=".25"')


def rocks(s: Svg, liquid, cx=400):
    bar_top(s)
    glass_shadow(s, cx, 120)
    s.path(f"M{cx - 120} 210 L{cx - 108} 465 L{cx + 108} 465 L{cx + 120} 210 Z", fill=liquid, extra='opacity=".88"')
    ice(s, cx - 95, 230, cx + 95, 440, 4)
    s.path(f"M{cx - 125} 150 L{cx - 108} 465 L{cx + 108} 465 L{cx + 125} 150", extra=GLASS)
    s.rect(cx, 455, 216, 22, "#e8f2ef", 0, rx=6, extra='opacity=".25"')
    s.ellipse(cx, 210, 120, 14, "#fff", 0, 'opacity=".18"')


def highball(s: Svg, liquid, cx=400, top=110):
    bar_top(s)
    glass_shadow(s, cx, 95)
    s.rect(cx, (top + 60 + 465) / 2, 170, 465 - top - 60, liquid, 0, rx=10, extra='opacity=".88"')
    ice(s, cx - 70, top + 80, cx + 70, 430, 5)
    bubbles(s, cx - 75, top + 70, cx + 75, 450, 24)
    s.rect(cx, (top + 465) / 2, 186, 465 - top, "#ffffff", 0, rx=14, extra=GLASS.replace('fill="#ffffff" ', ''))
    s.rect(cx, 450, 186, 30, "#e8f2ef", 0, rx=10, extra='opacity=".22"')
    s.rect(cx - 60, (top + 465) / 2, 16, 300, "#fff", 0, rx=8, extra='opacity=".16"')


def mug(s: Svg, cx=380):
    bar_top(s)
    glass_shadow(s, cx, 120)
    s.add(f'<path d="M{cx + 115} 220 C {cx + 210} 220 {cx + 210} 380 {cx + 115} 380" fill="none" stroke="#b36a3a" stroke-width="26"/>')
    s.add(f'<defs><linearGradient id="cu" x1="0" x2="1"><stop offset="0" stop-color="#e3a066"/><stop offset=".45" stop-color="#c97a43"/><stop offset="1" stop-color="#8a4a22"/></linearGradient></defs>')
    s.rect(cx, 315, 240, 300, "url(#cu)", 0, rx=22)
    s.ellipse(cx, 168, 120, 18, "#6a1424")
    for k in range(5):
        s.rect(cx, 210 + k * 50, 240, 4, "#8a4a22", 0, rx=2, extra='opacity=".35"')
    s.rect(cx - 70, 315, 22, 270, "#f3c296", 0, rx=10, extra='opacity=".35"')


def martini(s: Svg, liquid, cx=400):
    bar_top(s)
    glass_shadow(s, cx, 90)
    s.path(f"M{cx - 140} 150 L{cx} 320 L{cx + 140} 150 Z", fill=liquid, extra='opacity=".9"')
    s.path(f"M{cx - 160} 130 L{cx} 330 L{cx + 160} 130", extra=GLASS)
    for k in range(40):
        t = k / 39
        s.circle(cx - 160 + 320 * t, 130 + s.rng.uniform(-3, 3), 3, "#fbf6ea")
    s.rect(cx, 395, 12, 140, "#e8f2ef", 0, rx=6, extra='opacity=".45"')
    s.ellipse(cx, 465, 85, 13, "#e8f2ef", 0, 'opacity=".4"')


def wine_glass(s: Svg, liquid, cx=400, fill_to=290):
    bar_top(s)
    glass_shadow(s, cx, 90)
    s.add(f'<clipPath id="bowl"><path d="M{cx - 110} 120 C {cx - 130} 260 {cx - 90} 330 {cx} 335 C {cx + 90} 330 {cx + 130} 260 {cx + 110} 120 Z"/></clipPath>')
    s.add(f'<rect x="{cx - 140}" y="{fill_to}" width="280" height="80" fill="{liquid}" clip-path="url(#bowl)" opacity=".92"/>')
    s.ellipse(cx, fill_to, 108, 12, liquid, 0, 'clip-path="url(#bowl)"')
    s.path(f"M{cx - 110} 120 C {cx - 130} 260 {cx - 90} 330 {cx} 335 C {cx + 90} 330 {cx + 130} 260 {cx + 110} 120", extra=GLASS)
    s.rect(cx, 400, 12, 130, "#e8f2ef", 0, rx=6, extra='opacity=".45"')
    s.ellipse(cx, 465, 85, 13, "#e8f2ef", 0, 'opacity=".4"')
    s.ellipse(cx - 60, 200, 14, 50, "#fff", 10, 'opacity=".18"')


def flute(s: Svg, liquid, cx=400):
    bar_top(s)
    glass_shadow(s, cx, 70)
    s.path(f"M{cx - 52} 160 C {cx - 56} 300 {cx - 40} 340 {cx} 345 C {cx + 40} 340 {cx + 56} 300 {cx + 52} 160 Z", fill=liquid, extra='opacity=".85"')
    bubbles(s, cx - 40, 170, cx + 40, 330, 26)
    s.path(f"M{cx - 56} 90 C {cx - 60} 300 {cx - 40} 345 {cx} 350 C {cx + 40} 345 {cx + 60} 300 {cx + 56} 90", extra=GLASS)
    s.rect(cx, 408, 10, 116, "#e8f2ef", 0, rx=5, extra='opacity=".45"')
    s.ellipse(cx, 465, 70, 12, "#e8f2ef", 0, 'opacity=".4"')


def bottle(s: Svg, glass_color, label, cx=600):
    s.rect(cx, 330, 110, 270, glass_color, 0, rx=26)
    s.rect(cx, 180, 44, 110, glass_color, 0, rx=12)
    s.rect(cx, 128, 50, 26, "#1c1c1c", 0, rx=6)
    s.rect(cx, 340, 100, 110, label, 0, rx=6)
    s.rect(cx, 330, 70, 10, "#ffffff", 0, rx=3, extra='opacity=".5"')
    s.rect(cx, 352, 50, 6, "#ffffff", 0, rx=3, extra='opacity=".35"')
    s.rect(cx - 34, 330, 12, 230, "#fff", 0, rx=6, extra='opacity=".14"')


def pint(s: Svg, liquid, foam="#fbf3dc", hazy=False, cx=360):
    bar_top(s)
    glass_shadow(s, cx, 110)
    s.path(f"M{cx - 110} 150 L{cx - 88} 465 L{cx + 88} 465 L{cx + 110} 150 Z", fill=liquid, extra=f'opacity="{0.97 if hazy else 0.9}"')
    bubbles(s, cx - 80, 190, cx + 80, 450, 0 if hazy else 30)
    s.path(f"M{cx - 114} 160 C {cx - 90} 120 {cx + 90} 120 {cx + 114} 160 L{cx + 110} 185 L{cx - 110} 185 Z", fill=foam)
    for x in range(-90, 100, 36):
        s.circle(cx + x, 132 + abs(x) * 0.08, 20, foam)
    s.path(f"M{cx - 116} 110 L{cx - 88} 465 L{cx + 88} 465 L{cx + 116} 110", extra=GLASS)
    s.rect(cx - 64, 300, 14, 300, "#fff", 4, rx=7, extra='opacity=".14"')


def can(s: Svg, color, accent, cx=600):
    s.ellipse(cx, 470, 72, 10, "#000", 0, 'opacity=".4" filter="url(#blur)"')
    s.rect(cx, 330, 130, 260, color, 0, rx=14)
    s.rect(cx, 200, 120, 16, "#c9cfcf", 0, rx=6)
    s.rect(cx, 460, 120, 14, "#c9cfcf", 0, rx=6)
    s.rect(cx, 330, 130, 70, accent, 0, rx=0)
    for k in range(3):
        s.path(f"M{cx - 44} {318 + k * 14} q 22 -10 44 0 t 44 0", stroke="#ffffff", sw=4, extra='opacity=".7"')
    s.rect(cx - 40, 330, 16, 240, "#fff", 0, rx=8, extra='opacity=".18"')


# ---- cócteles ----

def c_thai_basil(s):
    coupe(s, "#cfe08a", "#f4f1e6")
    lime_wheel(s, 548, 165, 34, rot=20)
    leaf(s, 300, 150, 30, -20, "#3f7a2c"); leaf(s, 330, 140, 26, 30, "#4f8a35")


def c_yolanda(s):
    rocks(s, "#e2435a")
    for x, y in [(470, 150), (500, 175)]:
        s.ellipse(x, y, 26, 32, "#d63a4a"); s.seeds(x, y, 18, 8, "#f6e3a0")
    leaf(s, 470, 118, 16, -30)
    lime_wheel(s, 310, 150, 28, rot=-15)


def c_guava(s):
    coupe(s, "#f29a8a")
    for x, y, c in [(360, 165, "#e86aa0"), (410, 160, "#f2c14a"), (450, 170, "#a36ad1")]:
        for k in range(5):
            a = math.tau * k / 5
            s.ellipse(x + 12 * math.cos(a), y + 12 * math.sin(a), 11, 7, c, math.degrees(a))
        s.circle(x, y, 5, "#fff3b0")


def c_watermelon_marg(s):
    coupe(s, "#f0697a", "#f4f1e6")
    s.path("M520 175 A 60 60 0 0 1 640 175 Z", fill="#3f8a3a")
    s.path("M528 175 A 52 52 0 0 1 632 175 Z", fill="#ef5a6a")
    s.seeds(580, 158, 22, 7, "#2a1a1a")
    leaf(s, 290, 150, 22, 10, "#4f8a35"); leaf(s, 310, 140, 20, 60, "#4f8a35")


def c_cherry_mule(s):
    mug(s)
    lime_wheel(s, 300, 160, 30, rot=-25)
    for x, y in [(430, 150), (455, 140)]:
        s.path(f"M{x} {y} q 10 -40 30 -50", stroke="#4f6a2a", sw=3)
        s.circle(x, y, 16, CHERRY)
        s.ellipse(x - 5, y - 5, 5, 3, "#fff", -30, 'opacity=".4"')


def c_cooler(s):
    highball(s, "#f7a2a8")
    for k in range(3):
        s.circle(400, 170 + k * 70, 30, "#bfe0a8", 'opacity=".75" stroke="#6fa04a" stroke-width="4"')
    s.path("M450 110 L520 40", stroke="#e9e4da", sw=8)


def c_old_fashioned(s):
    rocks(s, "#b8641c")
    s.circle(400, 300, 50, "#ffffff", 'fill-opacity=".3" stroke="#fff" stroke-opacity=".5" stroke-width="2"')
    s.path("M300 150 C 330 110 400 110 430 140", stroke="#f08a2a", sw=16)
    s.path("M440 140 q 20 -50 50 -60", stroke="#4f6a2a", sw=3)
    s.circle(440, 140, 17, CHERRY)


def c_mojito(s):
    highball(s, "#e8506a")
    for x, y in s.pts(400, 300, 70, 8):
        leaf(s, x, y, 20, s.rng.uniform(0, 180), "#4f9a3a")
    for x, y in [(380, 420), (420, 400), (400, 440)]:
        s.circle(x, y, 14, "#c42a4a")
    leaf(s, 360, 100, 26, -30, "#4f9a3a"); leaf(s, 395, 92, 24, 20, "#5aa846")
    lime_wheel(s, 470, 115, 28, rot=10)


def c_lemon_drop(s):
    martini(s, "#f2e27a")
    s.path("M520 140 A 36 36 0 0 1 560 120", stroke=LEMON, sw=14)
    lavender_sprig(s, 300, 180, 110, -25)


def c_gin_fizz(s):
    highball(s, "#d8c8f0")
    s.rect(400, 140, 170, 40, "#fbf8f2", 0, rx=10, extra='opacity=".8"')
    lavender_sprig(s, 450, 150, 120, 12)
    s.path("M340 130 A 30 30 0 0 1 380 110", stroke=LEMON, sw=12)


# ---- vino ----

def w_rose(s):
    wine_glass(s, "#f2a3a8", 380)
    bottle(s, "#f6c9c4", "#fbf3ea", 610)


def w_white(s):
    wine_glass(s, "#f3e7a6", 380)
    bottle(s, "#7c9a54", "#fbf3ea", 610)


def w_chardonnay(s):
    wine_glass(s, "#ecc85a", 380)
    bottle(s, "#5f6e3a", "#efe3c8", 610)


def w_red(s):
    wine_glass(s, "#7a1428", 380)
    bottle(s, "#26201e", "#efe3c8", 610)


def w_sparkling(s):
    flute(s, "#f3e3a0", 380)
    bottle(s, "#3e5a3a", "#f3e7c8", 610)


# ---- cerveza ----

def b_(liquid, can_color, accent, hazy=False, foam="#fbf3dc"):
    def draw(s):
        pint(s, liquid, foam, hazy)
        can(s, can_color, accent)
    return draw


DISHES.update({
    "cocktail-thai-basil-margarita": c_thai_basil,
    "cocktail-yolanda-be-cool": c_yolanda,
    "cocktail-guava-a-love-story": c_guava,
    "cocktail-watermelon-cilantro-margarita": c_watermelon_marg,
    "cocktail-cherry-mule": c_cherry_mule,
    "cocktail-watermelon-cucumber-cooler": c_cooler,
    "cocktail-supper-club-old-fashioned": c_old_fashioned,
    "cocktail-raspberry-mint-mojito": c_mojito,
    "cocktail-lavender-lemon-drop-martini": c_lemon_drop,
    "cocktail-lavender-gin-fizz": c_gin_fizz,
    "wine-rose": w_rose,
    "wine-white": w_white,
    "wine-chardonnay": w_chardonnay,
    "wine-red": w_red,
    "wine-sparkling": w_sparkling,
    "beer-pilsner": b_("#f3d36a", "#e8e2d2", "#c8302a"),
    "beer-ipa": b_("#e9a73a", "#f2efe6", "#2f6a8a"),
    "beer-hazy": b_("#f0b84a", "#2a2a3a", "#e8b84a", hazy=True),
    "beer-blonde": b_("#f2c75a", "#f4e3b0", "#c98a2a"),
    "beer-wheat": b_("#f2cf72", "#e9eef0", "#4a8ab0", hazy=True),
    "beer-amber": b_("#b65a22", "#2f3a2a", "#c9a24a"),
    "beer-cherry": b_("#c96a3a", "#f3ede0", CHERRY),
    "beer-cherry-lager": b_("#c0443a", "#2a1a22", "#d8485a", foam="#fbe6dc"),
    "beer-cider": b_("#f2d78a", "#e9f0dc", "#7aa84a", foam="#fbf6e6"),
    "category-cocktails": composite(c_old_fashioned, c_thai_basil, c_mojito),
    "category-wine": composite(w_red, w_rose, w_sparkling),
    "category-beer": composite(b_("#e9a73a", "#f2efe6", "#2f6a8a"), b_("#f0b84a", "#2a2a3a", "#e8b84a", True), b_("#f2d78a", "#e9f0dc", "#7aa84a")),
})


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in DISHES.items():
        s = Svg(name)
        fn(s)
        (OUT / f"{name}.svg").write_text(s.svg(), encoding="utf-8")
    print(f"{len(DISHES)} ilustraciones en {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
