"""Find surfaces that sit on top of each other (a common cause of flickering).

Builds the scene without a browser and lists overlapping, same-facing flat faces
closer than 1.2 cm. Decals (wall lettering, drawings, labels) are expected to appear
with small deliberate gaps; floors and walls should not.
Usage: python3 tools/check-overlaps.py
"""
from pathlib import Path
import subprocess, tempfile, sys
root = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as d:
    subprocess.run([sys.executable, str(root/'tools/package-web.py'), '--output-dir', d], check=True, stdout=subprocess.DEVNULL)
    s = (Path(d)/'web-syntax-check.mjs').read_text()
    s = s[:s.index('function fail(error)')] + "\nrenderer={capabilities:{getMaxAnisotropy:()=>8}};buildWorld();\nexport {worldMeshes,scene,THREE,floorTargets};\n"
    h = Path(d)/'harness.mjs'; h.write_text(s)
    subprocess.run(['node', str(root/'tools/overlap-scan.mjs'), str(h)], check=True)
