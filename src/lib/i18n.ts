import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ko',
    defaultNS: 'common',
    ns: ['common', 'apps'],
    supportedLngs: ['ko', 'en'],
    backend: {
      loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/{{ns}}.json`,
    },
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      caches: ['localStorage'],
      lookupQuerystring: 'lang',
    },
    interpolation: {
      escapeValue: false,
    },
    // 2026-04-11: 빈 화면 방지 — 번역 파일 로딩 중 Suspense 블로킹 해제
    // false로 하면 로딩 중에는 키 그대로 보이고, 로드 완료 후 자동 교체
    react: {
      useSuspense: false,
    },
  });

export default i18n;
