"""Build a hostable copy of the museum: one page with all code inlined, plus the five artwork images.

Writes <output-dir>/index.html (body content only, for hosts that add their own page shell)
and <output-dir>/assets/memory-*.jpg.
"""
from pathlib import Path
import argparse, re, shutil

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description='Package the museum for web hosting.')
parser.add_argument('--output-dir', type=Path, default=root / 'release' / 'web')
args = parser.parse_args()
out = args.output_dir.resolve()
dist = root / 'dist'

def wrap(path):
    code = (dist / path).read_text()
    names = []
    m = re.search(r'\nexport \{([^}]*)\};?\s*$', code)
    if m:
        names += [n.strip() for n in m.group(1).split(',') if n.strip()]
        code = code[:m.start()] + '\n'
    def strip(mm):
        names.append(mm.group(2)); return mm.group(1)
    code = re.sub(r'^export ((?:const|let|function|class)\s+([A-Za-z_$][\w$]*))', strip, code, flags=re.M)
    assert not re.search(r'^\s*(import|export)\b', code, re.M), path
    assert all(' as ' not in n for n in names)
    return '(()=>{\n' + code + '\nreturn {' + ','.join(names) + '};\n})()'

app = (dist / 'app.js').read_text()
imports = {
    "import * as THREE from './vendor/three.module.js';": "const THREE=" + wrap('vendor/three.module.js') + ";",
}
for m in re.finditer(r"import \{([^}]*)\} from './(navigation|motion)\.mjs';", app):
    imports[m.group(0)] = 'const {' + m.group(1) + '}=' + wrap(m.group(2) + '.mjs') + ';'
for k, v in imports.items():
    assert k in app, k
    app = app.replace(k, v, 1)
assert "from './" not in app

html = (dist / 'index.html').read_text()
head = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
body = re.search(r'<body>(.*?)</body>', html, re.S).group(1)
title = '<title>Worth the Detour</title>'
assert '<script type="module" src="./app.js"></script>' in body
body = body.replace('<script type="module" src="./app.js"></script>',
                    '<script type="module">' + app.replace('</script', '<\\/script') + '</script>')
page = '\n'.join([
    title,
    '<meta name="description" content="A quiet walk through a museum of shared memories.">',
    '<style>' + (dist / 'style.css').read_text() + '</style>',
    body.strip(), ''])
out.mkdir(parents=True, exist_ok=True)
(out / 'index.html').write_text(page)
(out / 'web-syntax-check.mjs').write_text(app)
(out / 'assets').mkdir(exist_ok=True)
for f in sorted((dist / 'assets').glob('memory-*.jpg')):
    shutil.copy2(f, out / 'assets' / f.name)
print('Built hostable museum in', out)
