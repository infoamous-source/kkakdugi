// 기관 단위 프로도구 사용 기간 매핑
// key: 대문자 org_code, value: ISO 만료 시각 (KST 자정 기준)
export const ORG_PRO_ACCESS_EXPIRY: Record<string, string> = {
  HUC454: '2026-05-17T23:59:59+09:00', // 서울글로벌센터 — 수업 계약 종료일
};

export function hasOrgProAccess(orgCode: string | undefined | null, now: Date = new Date()): boolean {
  if (!orgCode) return false;
  const expiry = ORG_PRO_ACCESS_EXPIRY[orgCode.toUpperCase()];
  if (!expiry) return false;
  return now < new Date(expiry);
}

export function getOrgProExpiry(orgCode: string | undefined | null): Date | null {
  if (!orgCode) return null;
  const expiry = ORG_PRO_ACCESS_EXPIRY[orgCode.toUpperCase()];
  return expiry ? new Date(expiry) : null;
}
