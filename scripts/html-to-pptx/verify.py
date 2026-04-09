#!/usr/bin/env python3
"""
Verification: compare reference HTML slide captures against Keynote-rendered
PPTX slides via SSIM. Produces a report of slides needing rework.
"""
import os
import subprocess
import sys
import json
from pathlib import Path
from PIL import Image
import numpy as np
from skimage.metrics import structural_similarity as ssim

BASE = Path('/tmp/pptx-work/v2')
REF = BASE / 'reference'
RENDERED = BASE / 'rendered'
DIFF = BASE / 'diff'
DESKTOP = Path(os.path.expanduser('~/Desktop/서울글로벌센터'))
SCRIPT_DIR = Path('/Users/suni/kkakdugi/scripts/html-to-pptx')

RENDERED.mkdir(parents=True, exist_ok=True)
DIFF.mkdir(parents=True, exist_ok=True)


def export_keynote(pptx_path: Path, out_subdir: Path):
    out_subdir.mkdir(parents=True, exist_ok=True)
    print(f'  Keynote export: {pptx_path.name} → {out_subdir}')
    # Ensure Keynote is not currently holding the doc
    subprocess.run(['osascript', '-e',
                    'tell application "Keynote" to close every document saving no'],
                   capture_output=True)
    result = subprocess.run([
        'osascript',
        str(SCRIPT_DIR / 'export_keynote.applescript'),
        str(pptx_path),
        str(out_subdir),
    ], capture_output=True, text=True, timeout=300)
    if result.returncode != 0:
        print('    stderr:', result.stderr)
    return result.returncode == 0


def ssim_score(ref_path: Path, rendered_path: Path, diff_path: Path):
    try:
        ref = Image.open(ref_path).convert('RGB')
        ren = Image.open(rendered_path).convert('RGB')
    except Exception as e:
        return None, f'open failed: {e}'
    # Resize rendered to reference size
    if ren.size != ref.size:
        ren = ren.resize(ref.size, Image.LANCZOS)
    ref_arr = np.asarray(ref)
    ren_arr = np.asarray(ren)
    score, _ = ssim(ref_arr, ren_arr, channel_axis=-1, full=True)
    # Simple diff visualization
    diff = np.abs(ref_arr.astype(int) - ren_arr.astype(int)).astype(np.uint8)
    Image.fromarray(diff).save(diff_path)
    return score, None


def main():
    pptx_files = [
        ('day1', DESKTOP / 'day1_1to4교시.pptx'),
        ('day2', DESKTOP / 'day2_5to8교시.pptx'),
    ]
    all_results = []
    for prefix, pptx in pptx_files:
        out_dir = RENDERED / prefix
        out_dir.mkdir(parents=True, exist_ok=True)
        # Clean previous renders
        for f in out_dir.glob('*'): f.unlink()
        ok = export_keynote(pptx, out_dir)
        if not ok:
            print(f'  FAILED to export {prefix}')
            continue
        # Keynote names files like "file.001.png" or "file.pptx.001.png"
        # or "day1_1to4교시.001.png"
        rendered = sorted(out_dir.glob('*.png'))
        ref_pngs = sorted(REF.glob(f'{prefix}_*.png'))
        print(f'  {prefix}: {len(ref_pngs)} reference, {len(rendered)} rendered')
        if not rendered:
            print(f'  no rendered output found in {out_dir}')
            continue
        for i, ref in enumerate(ref_pngs):
            if i >= len(rendered): break
            ren = rendered[i]
            diff_path = DIFF / f'{prefix}_{i+1:02d}.png'
            score, err = ssim_score(ref, ren, diff_path)
            if score is not None:
                all_results.append({
                    'prefix': prefix,
                    'index': i + 1,
                    'ref': str(ref),
                    'rendered': str(ren),
                    'diff': str(diff_path),
                    'ssim': round(float(score), 4),
                })
    # Report
    all_results.sort(key=lambda r: (r['prefix'], r['index']))
    print()
    print('=' * 60)
    print('SSIM REPORT')
    print('=' * 60)
    pass_c = warn_c = fail_c = 0
    for r in all_results:
        tag = '✅' if r['ssim'] >= 0.92 else ('⚠️ ' if r['ssim'] >= 0.85 else '❌')
        print(f'  {tag} {r["prefix"]} s{r["index"]:02d}  ssim={r["ssim"]}')
        if r['ssim'] >= 0.92: pass_c += 1
        elif r['ssim'] >= 0.85: warn_c += 1
        else: fail_c += 1
    print()
    print(f'Pass: {pass_c}  Warn: {warn_c}  Fail: {fail_c}  Total: {len(all_results)}')

    report_path = BASE / 'verify-report.json'
    with open(report_path, 'w') as f:
        json.dump({'summary': {'pass': pass_c, 'warn': warn_c, 'fail': fail_c, 'total': len(all_results)},
                   'slides': all_results}, f, ensure_ascii=False, indent=2)
    print(f'Report: {report_path}')


if __name__ == '__main__':
    main()
