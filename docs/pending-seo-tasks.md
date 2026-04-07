# SEO 미완료 작업

## 완료된 작업
- [x] OG 이미지 생성 (SVG + PNG, `public/og-image.png`)
- [x] `useSEO` 훅 생성 및 4개 주요 페이지 적용
- [x] Google/네이버 인증 메타태그 자리 준비 (`index.html`)
- [x] robots.txt, sitemap.xml 준비 완료
- [x] JSON-LD 구조화 데이터 (EducationalOrganization, WebSite, Course)
- [x] OG 이미지 PNG 변환 스크립트 (`scripts/generate-og-image.mjs`)

## 보류 중인 작업 (도메인 연결 후 진행)

### 1. 커스텀 도메인 연결
- `kkakdugischool.com` 도메인 구매 필요
- Vercel에 도메인 연결 (현재 팀에는 `mindflow.app`만 등록됨)
- 또는 `kkakdugi.vercel.app` 공개 설정

### 2. Google Search Console 등록
- https://search.google.com/search-console 접속
- URL 접두어 방식으로 사이트 등록
- HTML 태그 인증 → `index.html`의 `google-site-verification` content 값 교체
- 사이트맵 제출: `https://kkakdugischool.com/sitemap.xml`

### 3. 네이버 서치어드바이저 등록
- https://searchadvisor.naver.com 접속
- 사이트 등록 → HTML 태그 인증 → `index.html`의 `naver-site-verification` content 값 교체
- 사이트맵 제출 + 웹 페이지 수집 요청

### 4. 다음(Daum) 검색 등록
- https://register.search.daum.net/index.daum

### 5. 소셜 미리보기 검증
- Facebook 디버거: https://developers.facebook.com/tools/debug/
- 카카오 캐시 초기화: https://developers.kakao.com/tool/debugger/sharing
- Google Rich Results Test: https://search.google.com/test/rich-results

## 참고
- 상세 등록 절차: `docs/seo-registration-guide.md`
