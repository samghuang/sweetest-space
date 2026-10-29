from pathlib import Path
import argparse,base64,json,zipfile
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Package the portable museum.')
parser.add_argument('--output-dir',type=Path,default=root/'release')
args=parser.parse_args()
out=args.output_dir.resolve()
dist=root/'dist'
def b64(data): return base64.b64encode(data).decode('ascii')
app=(dist/'app.js').read_text()
# Bundle every module into one inline script (no data: imports), so the file opens
# in browsers and previews that block imported modules from file:// pages.
import re
def wrap(path):
    code=(dist/path).read_text()
    names=[]
    m=re.search(r'\nexport \{([^}]*)\};?\s*$',code)
    if m:
        names+= [n.strip() for n in m.group(1).split(',') if n.strip()]
        code=code[:m.start()]+'\n'
    def strip(mm):
        names.append(mm.group(2)); return mm.group(1)
    code=re.sub(r'^export ((?:const|let|function|class)\s+([A-Za-z_$][\w$]*))',strip,code,flags=re.M)
    assert not re.search(r'^\s*(import|export)\b',code,re.M), path
    assert all(' as ' not in n for n in names)
    return '(()=>{\n'+code+'\nreturn {'+','.join(names)+'};\n})()'
imports={
 "import * as THREE from './vendor/three.module.js';":"const THREE="+wrap('vendor/three.module.js')+";",
}
for m in re.finditer(r"import \{([^}]*)\} from './(navigation|motion)\.mjs';", app):
    imports[m.group(0)] = 'const {' + m.group(1) + '}=' + wrap(m.group(2) + '.mjs') + ';'
for k,v in imports.items():
    assert k in app, k
    app=app.replace(k,v,1)
art=['data:image/jpeg;base64,'+b64((dist/f'assets/memory-{i}.jpg').read_bytes()) for i in range(1,len(list((dist/'assets').glob('memory-*.jpg')))+1)]
app='const embeddedArt='+json.dumps(art)+';\nconst assetURL=n=>embeddedArt[n-1];\n'+app
app=app.replace('`./assets/memory-${i+1}.jpg`','assetURL(i+1)').replace('`./assets/memory-${state.current+1}.jpg`','assetURL(state.current+1)')
assert './assets/' not in app and "from './" not in app and 'data:text/javascript' not in app
html=(dist/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="./style.css">','<style>'+(dist/'style.css').read_text()+'</style>')
html=html.replace('<script type="module" src="./app.js"></script>','<script type="module">'+app.replace('</script','<\\/script')+'</script>')
assert 'src="./app.js"' not in html and 'href="./style.css"' not in html
out.mkdir(parents=True,exist_ok=True)
(out/'worth-the-detour.html').write_text(html)
(out/'standalone-syntax-check.mjs').write_text(app)
with zipfile.ZipFile(out/'worth-the-detour-source.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted(dist.rglob('*')):
        if f.is_file(): z.write(f,'worth-the-detour/'+str(f.relative_to(root)))
    for f in sorted((root/'artwork-originals').glob('*.png')) if (root/'artwork-originals').exists() else []:
        z.write(f,'worth-the-detour/artwork-originals/'+f.name)
    for name in ['README.md','HANDOFF.md','artwork-prompts.json','tests/motion.test.mjs','tests/navigation.test.mjs','tests/autopilot.test.mjs','CLAUDE.md','package.json','tools/package-local.py','tools/package-web.py','tools/check-overlaps.py','tools/overlap-scan.mjs']:
        z.write(root/name,'worth-the-detour/'+name)
print('Updated standalone museum and portable source archive.')
