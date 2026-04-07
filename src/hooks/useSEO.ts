import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
}

const SITE_NAME = '깍두기학교';
const BASE_URL = 'https://kkakdugischool.com';
const DEFAULT_DESCRIPTION =
  '깍두기학교는 이주민·유학생이 한국 생활에 필요한 디지털·마케팅·커리어 역량을 AI 기반으로 배우는 무료 교육 플랫폼입니다.';

export function useSEO({ title, description, path }: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | 이주민·유학생을 위한 AI 한국어 생활 교육 플랫폼`;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = path ? `${BASE_URL}${path}` : BASE_URL;

    document.title = fullTitle;

    setMeta('description', desc);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', desc, true);
    setMeta('og:url', url, true);
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = url;
  }, [title, description, path]);
}

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (el) {
    el.content = content;
  } else {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    el.content = content;
    document.head.appendChild(el);
  }
}
