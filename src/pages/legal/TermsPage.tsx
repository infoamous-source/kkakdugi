import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * 이용약관 페이지 (한/영 최소 버전)
 * P0-3: 런칭 전 법적 최소 요건
 */
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-kk-bg">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="font-bold text-kk-brown">이용약관 (Terms of Service)</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-sm text-gray-700 leading-relaxed space-y-4">
          <p className="text-xs text-gray-400">
            시행일 (Effective date): 2026-04-10 · 최종 업데이트 2026-04-08
          </p>

          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">
              제1조 (목적) · Article 1 (Purpose)
            </h2>
            <p>
              본 약관은 깍두기학교(이하 "회사")가 제공하는 마케팅·디지털 교육 플랫폼(이하 "서비스")의
              이용과 관련하여 회사와 이용자(이하 "학생") 간의 권리, 의무 및 책임사항을 규정합니다.
            </p>
            <p className="mt-2 text-gray-500">
              These Terms govern the use of the Kkakdugi School marketing and digital education
              platform ("Service") between the operator ("Company") and the user ("Student").
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">
              제2조 (서비스 내용) · Article 2 (Service)
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>마케팅 학과 6교시 AI 도구 사용 (Use of 6-period marketing AI tools)</li>
              <li>디지털 한국생활 학과 키오스크/앱 시뮬레이터 (Digital life simulators)</li>
              <li>학습 진행도, 졸업증서, 팀 아이디어 보석함 (Progress, certificate, team gem box)</li>
              <li>강사 대시보드, 관리자 기능 (Instructor & admin dashboards)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">
              제3조 (계정 및 가입) · Article 3 (Account)
            </h2>
            <p>
              학생은 기관코드와 함께 이름·이메일·비밀번호를 입력하여 가입합니다. 현장 수강생은
              마스터 기관코드 <b>KKAKDUGI2026</b> 를 사용할 수 있습니다. 계정 정보는 본인이 관리하며,
              타인에게 공유하지 않아야 합니다.
            </p>
            <p className="mt-2 text-gray-500">
              Students register with an institution code, name, email, and password. Onsite students
              may use the master code <b>KKAKDUGI2026</b>. Do not share your account.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">
              제4조 (AI 도구 및 외부 API) · Article 4 (AI Tools & External APIs)
            </h2>
            <p>
              서비스는 학생이 직접 연결한 Google Gemini API 키를 사용하여 AI 결과를 생성합니다. 해당 키는
              학생 본인 계정에만 저장되며 다른 학생이 조회할 수 없습니다. Pexels 무료 이미지, Google
              Gemini 등 외부 서비스의 이용 약관도 함께 준수해야 합니다.
            </p>
            <p className="mt-2 text-gray-500">
              The Service uses the student's own Google Gemini API key to generate AI results. Keys
              are private to each account. Students must also comply with the terms of external
              services (Pexels, Google Gemini).
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">
              제5조 (학생의 의무) · Article 5 (Student Obligations)
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>타인의 저작물·개인정보를 불법으로 수집·가공·재배포하지 않음</li>
              <li>AI가 생성한 결과물의 사실 여부를 본인이 검증함</li>
              <li>서비스의 안정적 운영을 방해하는 행위(자동화 봇, 과도한 API 호출 등) 금지</li>
              <li>
                Do not misuse, scrape, or redistribute others' content/personal data. You are
                responsible for verifying AI-generated output.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">
              제6조 (책임의 제한) · Article 6 (Limitation of Liability)
            </h2>
            <p>
              회사는 무료 교육 목적의 서비스를 제공하며, AI 결과의 정확성·상업적 사용 적합성에 대해
              보증하지 않습니다. 서비스 이용으로 발생한 손해에 대해 회사는 고의 또는 중과실이 없는 한
              책임지지 않습니다.
            </p>
            <p className="mt-2 text-gray-500">
              The Service is provided for educational purposes. The Company makes no warranty
              regarding AI output accuracy or commercial fitness.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">
              제7조 (약관 변경 및 문의) · Article 7 (Changes & Contact)
            </h2>
            <p>
              약관 변경 시 서비스 내 공지합니다. 문의는 수업 담당 강사 또는 현장 운영자에게 전달하세요.
            </p>
            <p className="mt-2 text-gray-500">
              Changes will be announced in-app. Contact your instructor or onsite staff for
              inquiries.
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
