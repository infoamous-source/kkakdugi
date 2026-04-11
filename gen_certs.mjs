import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const students = JSON.parse(fs.readFileSync('/tmp/cert_students.json', 'utf8'));
const outDir = '/tmp/certs';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

function buildCertHtml(name, orgName) {
  const isKorean = /^[가-힣\s/]+$/.test(name.replace(/[^가-힣a-zA-Z\s/]/g, ''));
  const displayName = isKorean
    ? name.split('').filter(c => c !== ' ').join(' ')
    : name;
  const nameClass = displayName.length > 25 ? 'name xlong' : displayName.length > 15 ? 'name long' : 'name';

  const serial = `KKD-2026-MK-${String(Math.floor(Math.random()*90000)+10000)}`;
  const hash = '#' + Math.abs([...name].reduce((h,c)=>((h<<5)-h)+c.charCodeAt(0)|0,0)).toString(16).padStart(12,'0').slice(0,12);

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700;900&family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:wght@400;500;600;700&display=swap">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1200px; height:849px; font-family:'Noto Serif KR',serif; }

  .frame { position:relative; width:1200px; height:849px; overflow:hidden; background:linear-gradient(180deg,#fefdfb,#faf8f3); }

  /* 기요셰 프릴 테두리 */
  .frill { position:absolute; inset:0; z-index:2; pointer-events:none; }

  /* 내부 네이비 테두리 */
  .border1 { position:absolute; inset:22px; border:2.5px solid #1a2744; z-index:3; }
  .border2 { position:absolute; inset:27px; border:0.5px solid #2c4a7c; z-index:3; opacity:0.4; }

  /* 콘텐츠 */
  .content { position:relative; z-index:5; display:flex; flex-direction:column; align-items:center; justify-content:space-between; height:100%; padding:46px 80px 40px; text-align:center; }
  .top,.middle,.bottom { display:flex; flex-direction:column; align-items:center; width:100%; }

  .emblem { width:60px; height:60px; border:2px solid #1a2744; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
  .emblem-text { font-family:'Cinzel',serif; font-size:15px; font-weight:900; color:#1a2744; letter-spacing:2px; }

  .title { font-size:54px; font-weight:900; color:#1a2744; letter-spacing:20px; padding-left:20px; }
  .title-en { font-family:'Cinzel',serif; font-size:11px; color:#2c4a7c; letter-spacing:8px; text-transform:uppercase; margin-bottom:6px; }
  .line { width:340px; height:1px; background:linear-gradient(90deg,transparent,#1a2744,transparent); }

  .desc { font-size:16px; color:#444; line-height:2; letter-spacing:1.2px; }

  .name { font-size:38px; font-weight:700; color:#1a2744; letter-spacing:14px; padding:4px 20px 8px; border-bottom:2px solid #1a2744; display:inline-block; margin:8px 0; max-width:900px; word-break:keep-all; overflow-wrap:break-word; }
  .name.long { font-size:30px; letter-spacing:5px; }
  .name.xlong { font-size:24px; letter-spacing:3px; }

  .course-box { padding:8px 26px; border:2px solid #1a2744; margin:6px 0; display:inline-flex; flex-direction:column; align-items:center; gap:3px; }
  .course-name { font-size:16px; font-weight:700; color:#1a2744; letter-spacing:2px; }
  .course-date { font-size:13px; color:#2c4a7c; letter-spacing:2px; }
  .course-en { font-family:'Cormorant Garamond',serif; font-size:12px; color:#777; font-style:italic; margin-top:3px; letter-spacing:1px; }

  .footer { display:flex; justify-content:space-between; align-items:flex-end; width:100%; max-width:660px; }
  .footer-label { font-family:'Cinzel',serif; font-size:10px; color:#999; letter-spacing:2px; text-transform:uppercase; }
  .footer-value { font-size:14px; color:#1a2744; font-weight:600; letter-spacing:1.5px; margin-top:2px; }
  .footer-right { text-align:right; }

  .serial { position:absolute; top:32px; left:46px; z-index:6; font-family:'Cinzel',serif; font-size:9px; color:#aaa; letter-spacing:1.5px; line-height:1.4; }
  .serial-label { font-size:7px; color:#bbb; text-transform:uppercase; letter-spacing:2px; }
  .serial-hash { font-family:'Courier New',monospace; font-size:7.5px; color:#bbb; }

  .seal { position:absolute; right:80px; bottom:48px; width:86px; height:86px; z-index:6; }
</style>
</head>
<body>
<div class="frame">

  <!-- 기요셰 프릴 테두리 -->
  <svg class="frill" viewBox="0 0 1200 849" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="gh" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 10 C10 0, 30 0, 40 10 C30 20, 10 20, 0 10Z" fill="none" stroke="#1a2744" stroke-width="0.8" opacity="0.35"/>
        <path d="M5 10 C12 3, 28 3, 35 10 C28 17, 12 17, 5 10Z" fill="none" stroke="#2c4a7c" stroke-width="0.4" opacity="0.2"/>
      </pattern>
      <pattern id="gv" x="0" y="0" width="20" height="40" patternUnits="userSpaceOnUse">
        <path d="M10 0 C0 10, 0 30, 10 40 C20 30, 20 10, 10 0Z" fill="none" stroke="#1a2744" stroke-width="0.8" opacity="0.35"/>
        <path d="M10 5 C3 12, 3 28, 10 35 C17 28, 17 12, 10 5Z" fill="none" stroke="#2c4a7c" stroke-width="0.4" opacity="0.2"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="1200" height="20" fill="url(#gh)"/>
    <rect x="0" y="829" width="1200" height="20" fill="url(#gh)"/>
    <rect x="0" y="0" width="20" height="849" fill="url(#gv)"/>
    <rect x="1180" y="0" width="20" height="849" fill="url(#gv)"/>
    <g fill="#1a2744" opacity="0.4">
      <rect x="8" y="6" width="4" height="8"/><rect x="6" y="8" width="8" height="4"/>
      <rect x="1188" y="6" width="4" height="8"/><rect x="1186" y="8" width="8" height="4"/>
      <rect x="8" y="835" width="4" height="8"/><rect x="6" y="837" width="8" height="4"/>
      <rect x="1188" y="835" width="4" height="8"/><rect x="1186" y="837" width="8" height="4"/>
    </g>
  </svg>

  <div class="border1"></div>
  <div class="border2"></div>

  <div class="serial">
    <div class="serial-label">Serial No.</div>
    <div>${serial}</div>
    <div class="serial-hash">${hash}</div>
  </div>

  <div class="content">
    <div class="top">
      <div class="emblem"><span class="emblem-text">KS</span></div>
      <div class="title">수 료 증</div>
      <div class="title-en">Certificate of Completion</div>
      <div class="line"></div>
    </div>

    <div class="middle">
      <div class="desc">This is to certify that</div>
      <div class="${nameClass}">${displayName}</div>
      <div class="desc">위 사람은 서울글로벌센터가 주관하는</div>
      <div class="desc">아래 과정을 성실히 이수하였기에 이 증서를 수여합니다.</div>
      <div class="course-box">
        <div class="course-name">직무역량강화교육 - 예비 마케터 양성과정</div>
        <div class="course-date">2026. 04. 09 ~ 04. 10</div>
      </div>
      <div class="course-en">Job Competency Training - Prospective Marketer Program</div>
    </div>

    <div class="bottom">
      <div class="footer">
        <div>
          <div class="footer-label">Issued by</div>
          <div class="footer-value">서울글로벌센터</div>
          <div class="footer-label" style="margin-top:5px">In cooperation with</div>
          <div class="footer-value">에이머스교육컨설팅</div>
        </div>
        <div class="footer-right">
          <div class="footer-label">Date of Issue</div>
          <div class="footer-value">2026. 04. 10</div>
        </div>
      </div>
    </div>
  </div>

  <svg class="seal" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" stroke="#1a2744" stroke-width="3" fill="none"/>
    <circle cx="50" cy="50" r="38" stroke="#1a2744" stroke-width="0.5" fill="none" opacity="0.5"/>
    <text x="50" y="45" text-anchor="middle" font-size="11" font-family="'Cinzel',serif" fill="#1a2744" font-weight="700" letter-spacing="2">AMOUS</text>
    <text x="50" y="60" text-anchor="middle" font-size="13" font-family="'Cinzel',serif" fill="#1a2744" font-weight="900" letter-spacing="3">EDU</text>
    <text x="50" y="76" text-anchor="middle" font-size="5" font-family="'Noto Serif KR',serif" fill="#1a2744" opacity="0.7" letter-spacing="2">에이머스교육</text>
  </svg>
</div>
</body></html>`;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 849 });

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const html = buildCertHtml(s.name, s.org_name);
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    const safeName = s.name.replace(/[/\\?%*:|"<>]/g, '_').trim();
    const outPath = path.join(outDir, `cert_${safeName}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`[${i+1}/${students.length}] ${s.name}`);
  }
  await browser.close();
  console.log('Done!', outDir);
})();
