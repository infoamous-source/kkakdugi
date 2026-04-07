# 검색엔진 등록 가이드

사이트 배포 후 아래 순서대로 등록하세요.

---

## 1. Google Search Console

1. https://search.google.com/search-console 접속 (Google 계정 로그인)
2. "URL 접두어" 방식으로 `https://kkakdugischool.com` 입력
3. "HTML 태그" 인증 방식 선택
4. 제공되는 `content` 값을 복사
5. `index.html`의 `google-site-verification` meta 태그에 붙여넣기:
   ```html
   <meta name="google-site-verification" content="여기에_붙여넣기" />
   ```
6. 배포 후 "확인" 클릭
7. 왼쪽 메뉴 "Sitemaps" > `https://kkakdugischool.com/sitemap.xml` 제출

## 2. 네이버 서치어드바이저

1. https://searchadvisor.naver.com 접속 (네이버 계정 로그인)
2. "사이트 등록" > `https://kkakdugischool.com` 입력
3. "HTML 태그" 인증 방식 선택
4. 제공되는 `content` 값을 복사
5. `index.html`의 `naver-site-verification` meta 태그에 붙여넣기:
   ```html
   <meta name="naver-site-verification" content="여기에_붙여넣기" />
   ```
6. 배포 후 "소유확인" 클릭
7. "요청" > "사이트맵 제출" > `https://kkakdugischool.com/sitemap.xml`
8. "요청" > "웹 페이지 수집" > 대표 URL 수집 요청

## 3. 다음(Daum) 검색 등록

1. https://register.search.daum.net/index.daum 접속
2. URL 입력 후 등록 (별도 인증 없음)

## 4. Bing Webmaster Tools (선택)

1. https://www.bing.com/webmasters 접속
2. Google Search Console 연동하면 자동 설정됨

---

## 등록 후 확인 도구

- Google Rich Results Test: https://search.google.com/test/rich-results
- Facebook 디버거: https://developers.facebook.com/tools/debug/
- Twitter Card 검증기: https://cards-dev.twitter.com/validator
- 카카오 OG 캐시 초기화: https://developers.kakao.com/tool/debugger/sharing
