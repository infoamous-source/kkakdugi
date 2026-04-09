#!/usr/bin/env python3
"""
Embed Noto Sans KR into PPTX files so they render correctly on any PC
without requiring the font to be installed separately.

PPTX font embedding structure:
- ppt/fonts/font1.fntdata: raw TTF bytes
- [Content_Types].xml: add <Default Extension="fntdata" .../>
- ppt/presentation.xml: add <p:embeddedFontLst>
- ppt/_rels/presentation.xml.rels: add relationship rId pointing to font

The .fntdata file can be a raw TTF. PowerPoint 2016+ and Keynote both
accept this format for Latin + CJK fonts.
"""
import os
import shutil
import zipfile
from pathlib import Path
from lxml import etree

FONT_PATH = Path("/Users/suni/Library/Fonts/NotoSansKR[wght].ttf")
FONT_NAME = "Noto Sans KR"

PPTX_FILES = [
    "/Users/suni/Desktop/서울글로벌센터/day1_1to4교시.pptx",
    "/Users/suni/Desktop/서울글로벌센터/day2_5to8교시.pptx",
]

NSMAP = {
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'ct': 'http://schemas.openxmlformats.org/package/2006/content-types',
    'rel': 'http://schemas.openxmlformats.org/package/2006/relationships',
}


def embed_font(pptx_path: str):
    pptx_path = Path(pptx_path)
    tmp_dir = Path(f"/tmp/embed_{pptx_path.stem}")
    if tmp_dir.exists():
        shutil.rmtree(tmp_dir)
    tmp_dir.mkdir(parents=True)

    # Extract
    with zipfile.ZipFile(pptx_path, 'r') as z:
        z.extractall(tmp_dir)

    # 1. Copy font to ppt/fonts/font1.fntdata
    fonts_dir = tmp_dir / 'ppt' / 'fonts'
    fonts_dir.mkdir(exist_ok=True)
    font_dst = fonts_dir / 'font1.fntdata'
    shutil.copy(FONT_PATH, font_dst)

    # 2. [Content_Types].xml — add fntdata default
    ct_path = tmp_dir / '[Content_Types].xml'
    tree = etree.parse(str(ct_path))
    root = tree.getroot()
    ns_ct = NSMAP['ct']
    # Check if Default extension="fntdata" exists
    existing = root.findall(f'{{{ns_ct}}}Default')
    has_fntdata = any(e.get('Extension') == 'fntdata' for e in existing)
    if not has_fntdata:
        default = etree.SubElement(root, f'{{{ns_ct}}}Default')
        default.set('Extension', 'fntdata')
        default.set('ContentType', 'application/x-fontdata')
    tree.write(str(ct_path), xml_declaration=True, encoding='UTF-8', standalone=True)

    # 3. ppt/_rels/presentation.xml.rels — add relationship to font1.fntdata
    rels_path = tmp_dir / 'ppt' / '_rels' / 'presentation.xml.rels'
    rtree = etree.parse(str(rels_path))
    rroot = rtree.getroot()
    ns_rel = NSMAP['rel']
    # Determine next rId
    existing_ids = [e.get('Id') for e in rroot.findall(f'{{{ns_rel}}}Relationship')]
    next_n = 1
    while f'rId{next_n}' in existing_ids:
        next_n += 1
    font_rid = f'rId{next_n}'
    rel = etree.SubElement(rroot, f'{{{ns_rel}}}Relationship')
    rel.set('Id', font_rid)
    rel.set('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/font')
    rel.set('Target', 'fonts/font1.fntdata')
    rtree.write(str(rels_path), xml_declaration=True, encoding='UTF-8', standalone=True)

    # 4. ppt/presentation.xml — add <p:embeddedFontLst>
    pres_path = tmp_dir / 'ppt' / 'presentation.xml'
    ptree = etree.parse(str(pres_path))
    proot = ptree.getroot()
    ns_p = NSMAP['p']
    ns_a = NSMAP['a']
    ns_r = NSMAP['r']
    # Remove existing embeddedFontLst if present
    for ef in proot.findall(f'{{{ns_p}}}embeddedFontLst'):
        proot.remove(ef)
    eflst = etree.SubElement(proot, f'{{{ns_p}}}embeddedFontLst')
    ef = etree.SubElement(eflst, f'{{{ns_p}}}embeddedFont')
    font = etree.SubElement(ef, f'{{{ns_p}}}font')
    font.set('typeface', FONT_NAME)
    # Noto Sans KR panose (approximate): 020B0604020202020204
    font.set('panose', '020B0604020202020204')
    font.set('pitchFamily', '34')
    font.set('charset', '-127')  # SHIFTJIS_CHARSET used for CJK
    reg = etree.SubElement(ef, f'{{{ns_p}}}regular')
    reg.set(f'{{{ns_r}}}id', font_rid)
    # The embedded font order must be: embeddedFontLst comes BEFORE defaultTextStyle
    # Move it to be right before defaultTextStyle if present
    dts = proot.find(f'{{{ns_p}}}defaultTextStyle')
    if dts is not None:
        proot.remove(eflst)
        dts.addprevious(eflst)
    ptree.write(str(pres_path), xml_declaration=True, encoding='UTF-8', standalone=True)

    # 5. Repack zip
    out_path = pptx_path  # overwrite in place
    tmp_out = pptx_path.parent / f'{pptx_path.stem}.tmp.pptx'
    with zipfile.ZipFile(tmp_out, 'w', zipfile.ZIP_DEFLATED) as zout:
        for root_dir, dirs, files in os.walk(tmp_dir):
            for f in files:
                fp = Path(root_dir) / f
                arcname = fp.relative_to(tmp_dir).as_posix()
                zout.write(fp, arcname)
    shutil.move(str(tmp_out), str(out_path))
    shutil.rmtree(tmp_dir)

    size_mb = out_path.stat().st_size / 1024 / 1024
    print(f'[OK] {out_path.name}  (embedded Noto Sans KR, {size_mb:.1f} MB)')


if __name__ == '__main__':
    if not FONT_PATH.exists():
        print(f'ERROR: Font not found: {FONT_PATH}')
        exit(1)
    for pf in PPTX_FILES:
        embed_font(pf)
