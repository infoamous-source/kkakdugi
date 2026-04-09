/** 국가 목록 — 이주민/유학생 교육 플랫폼 대상 국가 (한영 병기) */
export interface Country {
  code: string;
  ko: string;
  en: string;
}

export const COUNTRIES: Country[] = [
  { code: 'KR', ko: '대한민국', en: 'South Korea' },
  // 동아시아
  { code: 'CN', ko: '중국', en: 'China' },
  { code: 'JP', ko: '일본', en: 'Japan' },
  { code: 'TW', ko: '대만', en: 'Taiwan' },
  // 동남아시아
  { code: 'VN', ko: '베트남', en: 'Vietnam' },
  { code: 'PH', ko: '필리핀', en: 'Philippines' },
  { code: 'ID', ko: '인도네시아', en: 'Indonesia' },
  { code: 'TH', ko: '태국', en: 'Thailand' },
  { code: 'MY', ko: '말레이시아', en: 'Malaysia' },
  { code: 'SG', ko: '싱가포르', en: 'Singapore' },
  { code: 'MM', ko: '미얀마', en: 'Myanmar' },
  { code: 'KH', ko: '캄보디아', en: 'Cambodia' },
  // 남아시아
  { code: 'NP', ko: '네팔', en: 'Nepal' },
  { code: 'LK', ko: '스리랑카', en: 'Sri Lanka' },
  { code: 'BD', ko: '방글라데시', en: 'Bangladesh' },
  { code: 'PK', ko: '파키스탄', en: 'Pakistan' },
  // 중앙아시아
  { code: 'UZ', ko: '우즈베키스탄', en: 'Uzbekistan' },
  { code: 'KZ', ko: '카자흐스탄', en: 'Kazakhstan' },
  { code: 'KG', ko: '키르기스스탄', en: 'Kyrgyzstan' },
  { code: 'MN', ko: '몽골', en: 'Mongolia' },
  // 기타 지역
  { code: 'TR', ko: '튀르키예', en: 'Türkiye' },
  { code: 'RU', ko: '러시아', en: 'Russia' },
  { code: 'US', ko: '미국', en: 'United States' },
  { code: 'OTHER', ko: '기타', en: 'Other' },
];
