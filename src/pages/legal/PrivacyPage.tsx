import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * 개인정보처리방침 (한/영 최소 버전)
 * P0-3: 런칭 전 법적 최소 요건
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-kk-bg">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="font-bold text-kk-brown">개인정보처리방침 (Privacy Policy)</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-sm text-gray-700 leading-relaxed space-y-4">
          <p className="text-xs text-gray-400">
            시행일 (Effective date): 2026-04-10 · 최종 업데이트 2026-04-08
          </p>

          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">
              1. 수집하는 개인정보 · Personal Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>필수: 이름, 이메일, 비밀번호(해시), 국가, 성별, 출생년도</li>
              <li>선택: 선생님코드, 기관코드</li>
              <li>
                자동 수집: 학습 진행도, 스탬프, 적성검사 결과, 도구 사용 로그, 접속 IP/기기 정보
              </li>
              <li>
                학생 본인 연결 AI 키 (Google Gemini) — 본인 계정에만 저장, 다른 학생 비노출
              </li>
              <li className="text-gray-500">
                Required: name, email, password hash, country, gender, birth year. Optional:
                teacher/institution codes. Auto-collected: progress, stamps, tool logs, IP/device.
                Your own AI key is stored only on your account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">
              2. 이용 목적 · Purpose of Use
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>학습 제공, 진도 관리, 졸업 증서 발급</li>
              <li>강사/기관 관리자의 학생 현황 파악</li>
              <li>AI 도구 호출 및 결과 저장</li>
              <li>보안·부정 이용 방지</li>
              <li className="text-gray-500">
                Providing education, progress tracking, certificate issuance, instructor dashboard,
                AI tool execution, and security.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">
              3. 보관 기간 · Retention Period
            </h2>
            <p>
              계정 삭제 요청 시까지 또는 마지막 접속 후 3년까지. 법령에 따라 보존이 필요한 정보는
              해당 기간 동안 보관합니다.
            </p>
            <p className="mt-2 text-gray-500">
              Until account deletion request, or up to 3 years after last login.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">
              4. 제3자 제공 · Third Parties
            </h2>
            <p>
              회사는 학생의 동의 없이 개인정보를 제3자에게 판매·대여하지 않습니다. 다만 다음 처리위탁
              업체의 인프라를 사용합니다:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Supabase (인증·DB, 미국·아시아 리전)</li>
              <li>Vercel (호스팅)</li>
              <li>Google Gemini API (학생이 직접 연결한 AI 키로 호출)</li>
              <li>Pexels (무료 이미지 검색, 개인정보 전송 없음)</li>
            </ul>
            <p className="mt-2 text-gray-500">
              We do not sell or rent your data. We use Supabase (auth/DB), Vercel (hosting), Google
              Gemini API (via your own key), and Pexels (image search, no PII sent).
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">
              5. 학생의 권리 · Your Rights
            </h2>
            <p>
              학생은 언제든지 본인 정보 열람·수정·삭제·다운로드를 요청할 수 있습니다. 요청은 수업
              담당 강사 또는 현장 운영자에게 전달하세요.
            </p>
            <p className="mt-2 text-gray-500">
              You can request access, correction, deletion, or export of your data at any time via
              your instructor or onsite staff.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">
              6. 보안 조치 · Security
            </h2>
            <p>
              비밀번호는 암호화 저장됩니다. 접근 권한은 본인(RLS)·강사·관리자로 분리되어 있으며,
              전송 구간은 TLS(HTTPS)로 보호됩니다.
            </p>
            <p className="mt-2 text-gray-500">
              Passwords are hashed. Access is isolated via Row-Level Security. Transport is
              TLS-encrypted.
            </p>
          </section>
        </div>

        <div className="text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← 홈으로 (Home)
          </Link>
        </div>
      </main>
    </div>
  );
}
