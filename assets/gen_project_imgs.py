#!/usr/bin/env python3
"""Generate two dark hero illustrations used on the projects page."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 1200, 720

def base(w=W, h=H):
    img = Image.new("RGB", (w, h), (8, 10, 16))
    d = ImageDraw.Draw(img)
    return img, d

def grid(d, color=(24, 28, 36)):
    step = 32
    for x in range(0, W, step):
        d.line([(x, 0), (x, H)], fill=color, width=1)
    for y in range(0, H, step):
        d.line([(0, y), (W, y)], fill=color, width=1)

# ---------- Project 1: HealthScribe mock UI ----------
img, d = base()
grid(d, (20, 25, 35))

# side rail (looks like a chat sidebar)
d.rectangle([0, 0, 200, H], fill=(11, 14, 22))
d.rectangle([24, 24, 184, 56], outline=(38, 46, 60), width=1)
d.text((36, 36), "HealthScribe", fill=(170, 200, 230))
d.rectangle([24, 96, 180, 280], outline=(38, 46, 60), width=1)
d.text((36, 110), "uploads", fill=(110, 130, 160))
d.text((36, 134), "rx_01.jpg", fill=(180, 200, 230))
d.text((36, 154), "rx_02.jpg", fill=(180, 200, 230))
d.text((36, 174), "rx_03.jpg", fill=(180, 200, 230))
d.text((36, 194), "rx_04.jpg", fill=(180, 200, 230))
d.rectangle([24, 590, 180, 630], fill=(70, 110, 170))
d.text((40, 600), "Sign in", fill=(230, 240, 255))

# main column — a "document card"
d.rectangle([260, 60, 1100, 660], outline=(38, 46, 60), width=1)
d.text((300, 100), "How can I help you today?", fill=(220, 232, 255))
d.rectangle([720, 90, 760, 130], outline=(50, 60, 78), width=1)
d.text((730, 102), "HS", fill=(170, 200, 230))
# prompt cards
for i, (x, y, t, sub) in enumerate([
    (300, 200, "Extract Rx entities", "sarvam + gemini"),
    (560, 200, "Allergy conflict check", "guardrails"),
    (300, 380, "Summarize history",   "mmr + rerank"),
    (560, 380, "Compare doctors",      "structured json"),
]):
    d.rectangle([x, y, x + 240, y + 130], outline=(48, 58, 76), width=1)
    d.text((x + 14, y + 18), t, fill=(220, 232, 255))
    d.text((x + 14, y + 50), sub, fill=(110, 130, 160))
# input bar
d.rectangle([300, 560, 1060, 610], outline=(48, 58, 76), width=1)
d.text((320, 580), "Ask anything about your prescriptions…", fill=(110, 130, 160))
# caption text (no actual text needed; image is decoration)

img.save(Path(__file__).parent / "project-healthscribe.png", "PNG")

# ---------- Project 2: VeriFrame mock UI ----------
img, d = base()
grid(d, (20, 25, 35))

d.rectangle([0, 0, W, 70], fill=(11, 14, 22))
d.text((40, 28), "VeriFrame", fill=(220, 232, 255))
d.text((280, 28), "forensics · multi-agent", fill=(110, 130, 160))

# video player frame
d.rectangle([60, 110, 740, 540], fill=(6, 8, 12), outline=(38, 46, 60), width=1)
# timeline grid
d.rectangle([60, 540, 740, 580], fill=(11, 14, 22))
for x in range(60, 740, 28):
    d.line([(x, 544), (x, 576)], fill=(38, 46, 60), width=1)
# playhead
d.line([(380, 540), (380, 580)], fill=(170, 110, 240), width=2)
# play btn
d.ellipse([110, 280, 170, 340], outline=(170, 110, 240), width=2)
d.polygon([(130, 295), (130, 325), (160, 310)], fill=(170, 110, 240))

# right panel — verdicts
for i, (y, label, score, color) in enumerate([
    (140, "frame sampler",  "0.93", (110, 130, 160)),
    (200, "vit (visual)",   "0.88", (170, 110, 240)),
    (260, "cv · mediapipe", "0.71", (220, 180, 110)),
    (320, "llama 4 scout",  "0.92", (170, 110, 240)),
]):
    d.rectangle([780, y, 1120, y + 50], outline=(38, 46, 60), width=1)
    d.text((800, y + 16), label, fill=(220, 232, 255))
    d.text((1080, y + 16), score, fill=color)

# final verdict badge
d.rectangle([820, 420, 1080, 520], outline=(170, 110, 240), width=2, fill=(20, 16, 36))
d.text((860, 446), "verdict: fake", fill=(220, 180, 255))
d.text((860, 472), "confidence 0.92", fill=(170, 130, 220))

img.save(Path(__file__).parent / "project-veriframe.png", "PNG")
print("done")
