/**
 * @deprecated 가입 폼 v6 (2026-04-08) 이후 사용 안 함.
 * PRD: docs/prd-signup-form-v5.md
 *
 * 학과별 추가 정보 입력 폼이 폐지되면서 pending_info 상태의 enrollment가
 * 더 이상 생성되지 않는다. 기존 pending 데이터는 DB 마이그레이션에서
 * 자동 active 처리해야 한다. 이 컴포넌트는 빈 컴포넌트로 남겨 호환성만 유지.
 */
export default function PendingEnrollmentBanner() {
  return null;
}
