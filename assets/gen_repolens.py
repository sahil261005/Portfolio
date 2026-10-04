#!/usr/bin/env python3
"""Dark UI mock for RepoLens — knowledge-graph traversal with weighted edges."""
from PIL import Image, ImageDraw
from pathlib import Path
import math, random

W, H = 1200, 720
img = Image.new('RGB', (W, H), (8, 10, 16))
d = ImageDraw.Draw(img)
random.seed(7)

# faint grid
for x in range(0, W, 32): d.line([(x, 0), (x, H)], fill=(18, 22, 30), width=1)
for y in range(0, H, 32): d.line([(0, y), (W, y)], fill=(18, 22, 30), width=1)

# top bar
d.rectangle([0, 0, W, 60], fill=(11, 14, 22))
d.text((36, 22), "RepoLens", fill=(220, 232, 255))
d.text((160, 22), "·", fill=(80, 90, 110))
d.text((180, 22), "retrieval-intelligence workbench", fill=(140, 150, 170))

# query bar
d.rectangle([200, 100, 1080, 156], outline=(38, 46, 60), width=1)
d.text((220, 118), "Q>", fill=(98, 162, 232))
d.text((252, 118), "Who authored the PR that closed the login bug?", fill=(220, 232, 255))

# left sidebar — graph nodes list
d.rectangle([0, 60, 200, H], fill=(11, 14, 22))
d.text((20, 86), "NODES", fill=(110, 130, 160))
nodes_left = ["@alice", "@bob", "PR #421", "PR #388", "issue #117", "commit a3c…"]
for i, n in enumerate(nodes_left):
    d.text((20, 116 + i * 28), "● " + n, fill=(180, 200, 230))

# main canvas — radial graph traversal
canvas = (240, 180, 880, 580)
d.rectangle(canvas, fill=(6, 8, 12), outline=(38, 46, 60), width=1)

# central query node
cx, cy = (canvas[0] + canvas[2]) // 2, (canvas[1] + canvas[3]) // 2
nodes = [
    (cx, cy, "query",       (170, 110, 240)),
    (cx - 240, cy + 40, "issue\n#117", (98, 162, 232)),
    (cx - 120, cy - 130, "@alice", (220, 180, 110)),
    (cx + 180, cy - 110, "PR #421", (98, 162, 232)),
    (cx + 260, cy + 60, "PR #388", (98, 162, 232)),
    (cx - 60, cy + 160, "commit\na3c…", (180, 200, 230)),
    (cx + 80, cy + 180, "commit\n7e9…", (180, 200, 230)),
]

def draw_edge(p1, p2, weight, label):
    # weight -> alpha-ish thickness
    width = max(1, int(weight * 6))
    color = (170, 130, 220)
    d.line([p1, p2], fill=color, width=width)
    # midpoint label
    mx, my = (p1[0] + p2[0]) // 2, (p1[1] + p2[1]) // 2
    d.rectangle([mx - 18, my - 10, mx + 18, my + 10], outline=(60, 50, 90), fill=(20, 16, 36))
    d.text((mx - 12, my - 6), label, fill=(220, 200, 255))

# draw weighted edges with relationships
# pa, pb are integer node indices
e = [
    (0, 1, 0.90, "RESOLVES"),
    (1, 2, 0.95, "AUTHORED"),
    (1, 3, 0.95, "AUTHORED"),
    (3, 4, 0.70, "MENTIONS"),
    (2, 5, 0.95, "AUTHORED"),
    (2, 6, 0.95, "AUTHORED"),
]
for (pa, pb, w, lbl) in e:
    draw_edge((nodes[pa][0], nodes[pa][1]), (nodes[pb][0], nodes[pb][1]), w, lbl)

# draw nodes last (so they sit on top)
for x, y, lbl, color in nodes:
    r = 26 if "query" in lbl else 20
    d.ellipse([x - r, y - r, x + r, y + r], outline=color, width=2, fill=(20, 16, 36))
    for li, line in enumerate(lbl.split('\n')):
        d.text((x - len(line) * 3, y - 14 + li * 12), line, fill=color)

# right panel — evidence tier list + fusion slider
panel = (910, 180, 1180, 580)
d.rectangle(panel, fill=(11, 14, 22), outline=(38, 46, 60), width=1)
d.text((924, 196), "EVIDENCE", fill=(110, 130, 160))
items = [
    ("PR #421",        "high",   (130, 200, 130)),
    ("@alice",         "high",   (130, 200, 130)),
    ("PR #388",        "medium", (220, 200, 120)),
    ("commit a3c…",    "medium", (220, 200, 120)),
    ("issue #117",     "low",    (180, 130, 130)),
    ("commit 7e9…",    "low",    (180, 130, 130)),
]
for i, (n, tier, color) in enumerate(items):
    y = 226 + i * 38
    d.text((924, y - 4), n, fill=(220, 232, 255))
    d.rectangle([1060, y, 1130, y + 18], outline=color, width=1)
    d.text((1068, y + 2), tier, fill=color)

d.text((924, 470), "FUSION", fill=(110, 130, 160))
d.text((924, 494), "vector 0.8", fill=(140, 150, 170))
d.line([(924, 514), (1160, 514)], fill=(60, 70, 90), width=3)
d.ellipse([1024 - 6, 508, 1024 + 6, 520], fill=(170, 110, 240))
d.text((924, 526), "graph 0.2", fill=(140, 150, 170))

img.save(Path(__file__).parent / "project-repolens.png", "PNG")
print("done")
