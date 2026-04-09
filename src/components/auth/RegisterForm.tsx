import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Mail,
  Lock,
  Globe,
  Calendar,
  Tag,
  UserPlus,
  Loader2,
  CheckCircle2,
  XCircle,
  Languages,
  Clock,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { parseAuthError, type AuthError } from '../../utils/authErrors';
import { validateOrgCode } from '../../services/organizationService';
import { COUNTRIES } from '../../data/countries';

// 가입 폼 v6 (PRD: docs/prd-signup-form-v5.md)
// - 인증코드/선생님코드 완전 제거 (마케팅 AI 도구 사이트의 잘못된 복붙 잔재였음)
// - 강사 자동 매칭: 기관코드 입력 → 강사 자동 연결
// - 신규 필드 3개: koreanLevel / yearsInKorea / visaType
// - 비자는 칩(chip) UI로 선택
// - 학과별 추가 폼 폐지: 가입 = 1단계로 끝

// 외국인 현장 가입용 마스터 기관코드 (기존 P0-1 정책 유지)
const MASTER_ORG_CODE = 'KKAKDUGI2026';

// ─── 옵션 정의 (TOPIK 3-4 친화 한국어 + 영어 병기) ─────────────────────

const KOREAN_LEVEL_OPTIONS = [
  { value: 'topik0', ko: 'TOPIK 0 (모름)', en: 'No Korean' },
  { value: 'topik1', ko: 'TOPIK 1', en: 'TOPIK 1' },
  { value: 'topik2', ko: 'TOPIK 2', en: 'TOPIK 2' },
  { value: 'topik3', ko: 'TOPIK 3', en: 'TOPIK 3' },
  { value: 'topik4', ko: 'TOPIK 4', en: 'TOPIK 4' },
  { value: 'topik5', ko: 'TOPIK 5', en: 'TOPIK 5' },
  { value: 'topik6', ko: 'TOPIK 6 (잘함)', en: 'Fluent' },
] as const;

const YEARS_IN_KOREA_OPTIONS = [
  { value: 'under6m', ko: '6개월 안 됐어요', en: 'Less than 6 months' },
  { value: '6m_1y',   ko: '6개월 ~ 1년',     en: '6 months ~ 1 year' },
  { value: '1y_3y',   ko: '1년 ~ 3년',       en: '1 ~ 3 years' },
  { value: '3y_5y',   ko: '3년 ~ 5년',       en: '3 ~ 5 years' },
  { value: '5y_10y',  ko: '5년 ~ 10년',      en: '5 ~ 10 years' },
  { value: 'over10y', ko: '10년 넘었어요',   en: 'Over 10 years' },
] as const;

// 비자 옵션 (칩 UI). 사용자 결정: 다 포함, 칩으로 선택
const VISA_OPTIONS = [
  { value: 'E7',    ko: 'E-7',  desc: '전문직 / Professional' },
  { value: 'E9',    ko: 'E-9',  desc: '일반 취업 / Non-pro' },
  { value: 'F2',    ko: 'F-2',  desc: '거주 / Residence' },
  { value: 'F4',    ko: 'F-4',  desc: '재외동포 / Overseas KR' },
  { value: 'F5',    ko: 'F-5',  desc: '영주 / Permanent' },
  { value: 'F6',    ko: 'F-6',  desc: '결혼 / Marriage' },
  { value: 'D2',    ko: 'D-2',  desc: '유학 / Study' },
  { value: 'D4',    ko: 'D-4',  desc: '어학연수 / Language' },
  { value: 'H2',    ko: 'H-2',  desc: '방문취업 / Working Visit' },
  { value: 'other', ko: '기타', desc: 'Other' },
  { value: 'none',  ko: '없음', desc: 'No visa / Don\'t know' },
] as const;

/** 비밀번호 강도 검사 */
function checkPassword(pw: string) {
  return {
    hasLetter: /[a-zA-Z]/.test(pw),
    hasNumber: /\d/.test(pw),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(pw),
    hasLength: pw.length >= 8,
  };
}

function isStrongPassword(pw: string) {
  const c = checkPassword(pw);
  return c.hasLetter && c.hasNumber && c.hasSpecial && c.hasLength;
}

export default function RegisterForm() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    gender: '' as '' | 'male' | 'female',
    birthYear: '',
    email: '',
    password: '',
    passwordConfirm: '',
    orgCode: '',
    // v6 신규 필드
    koreanLevel: '',
    yearsInKorea: '',
    visaType: '',
  });

  // 약관 동의
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const agreedAll = agreeTerms && agreePrivacy;
  const toggleAllAgree = () => {
    const next = !(agreeTerms && agreePrivacy && agreeMarketing);
    setAgreeTerms(next);
    setAgreePrivacy(next);
    setAgreeMarketing(next);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // 기관코드 실시간 검증 + 강사 자동 매칭 표시
  const [orgValidation, setOrgValidation] = useState<{
    valid: boolean;
    orgName: string | null;
    instructorId: string | null;
    instructorName: string | null;
  } | null>(null);
  const [isValidatingOrg, setIsValidatingOrg] = useState(false);

  useEffect(() => {
    if (formData.orgCode.length < 6) {
      setOrgValidation(null);
      return;
    }
    // 마스터 코드 즉시 통과 (강사 미지정)
    if (formData.orgCode.toUpperCase() === MASTER_ORG_CODE) {
      setOrgValidation({
        valid: true,
        orgName: '깍두기학교 · Onsite (KKAKDUGI School)',
        instructorId: null,
        instructorName: null,
      });
      setIsValidatingOrg(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsValidatingOrg(true);
      const result = await validateOrgCode(formData.orgCode);
      setOrgValidation({
        valid: result.valid,
        orgName: result.orgName,
        instructorId: result.instructorId,
        instructorName: result.instructorName,
      });
      setIsValidatingOrg(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.orgCode]);

  // 비밀번호 강도
  const pwCheck = useMemo(() => checkPassword(formData.password), [formData.password]);
  const pwMismatch = formData.passwordConfirm.length > 0 && formData.password !== formData.passwordConfirm;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 출생년도 옵션 (2010 ~ 1940)
  const birthYearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = 2010; y >= 1940; y--) years.push(y);
    return years;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 클라이언트 유효성 검사
    if (!isStrongPassword(formData.password)) {
      setError({
        title: '비밀번호 오류 (Password Error)',
        reason: '비밀번호가 조건을 충족하지 않습니다 (Password does not meet requirements)',
        solution: '영문, 숫자, 특수문자를 포함하여 8자 이상 입력하세요 (Use 8+ chars with letters, numbers, special chars)',
      });
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError({
        title: '비밀번호 오류 (Password Error)',
        reason: '비밀번호가 일치하지 않습니다 (Passwords do not match)',
        solution: '비밀번호를 다시 확인해주세요 (Please re-check your password)',
      });
      return;
    }

    if (!formData.gender) {
      setError({
        title: '입력 오류 (Input Error)',
        reason: '성별을 선택해주세요 (Please select your gender)',
        solution: '남성 또는 여성을 선택하세요 (Select Male or Female)',
      });
      return;
    }

    // v6 신규 필수 필드 검증
    if (!formData.koreanLevel) {
      setError({
        title: '입력 오류 (Input Error)',
        reason: '한국어 수준을 선택해주세요 (Please select your Korean level)',
        solution: 'TOPIK 0~6 중 하나를 선택하세요',
      });
      return;
    }
    if (!formData.yearsInKorea) {
      setError({
        title: '입력 오류 (Input Error)',
        reason: '한국에 온 지 얼마나 됐는지 알려주세요 (Please tell us how long you have been in Korea)',
        solution: '체류 기간을 선택하세요',
      });
      return;
    }
    if (!formData.visaType) {
      setError({
        title: '입력 오류 (Input Error)',
        reason: '비자 종류를 선택해주세요 (Please select your visa)',
        solution: '비자 카드 중 하나를 선택하세요',
      });
      return;
    }

    if (!agreeTerms || !agreePrivacy) {
      setError({
        title: '동의 필요 (Consent Required)',
        reason: '이용약관과 개인정보처리방침에 동의해야 가입할 수 있어요',
        solution:
          'You must agree to the Terms of Service and Privacy Policy to continue.',
      });
      return;
    }

    setIsLoading(true);
    try {
      // 기관코드 유효성 검증 (마스터 코드는 우회) + 강사 자동 매칭
      const isMasterOrgCode = formData.orgCode.toUpperCase() === MASTER_ORG_CODE;
      let instructorId: string | null = null;

      if (!isMasterOrgCode) {
        const orgResult = await validateOrgCode(formData.orgCode);
        if (!orgResult.valid) {
          setError({
            title: '기관코드 오류 (Institution Code Error)',
            reason: '유효하지 않은 기관코드입니다 (Invalid institution code)',
            solution: `현장 가입은 "${MASTER_ORG_CODE}" 코드를 사용하세요 (Onsite students use code: ${MASTER_ORG_CODE})`,
          });
          setIsLoading(false);
          return;
        }
        instructorId = orgResult.instructorId;
      }

      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        orgCode: formData.orgCode,
        country: formData.country,
        gender: formData.gender as 'male' | 'female',
        birthYear: parseInt(formData.birthYear, 10),
        koreanLevel: formData.koreanLevel,
        yearsInKorea: formData.yearsInKorea,
        visaType: formData.visaType,
        instructorId,
      });
      navigate('/register-complete');
    } catch (err) {
      setError(parseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-kk-bg to-kk-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-kk-red to-kk-red-deep rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t('register.title', '학생등록 (Student Registration)')}
          </h1>
          <p className="text-gray-500 mt-2">
            {t('register.subtitle', '학습을 시작하기 위해 등록해주세요 (Register to start learning)')}
          </p>
        </div>

        {/* 현장 학생 안내 배너 */}
        <div className="mb-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🏫</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900 mb-1">
                현장 수강생이신가요? (Onsite student?)
              </p>
              <p className="text-xs text-amber-800 mb-2">
                아래 기관코드를 사용하세요 (Use this institution code):
              </p>
              <div className="bg-white border border-amber-400 rounded-lg px-3 py-2 inline-block">
                <code className="text-base font-black text-amber-900 tracking-wider">
                  {MASTER_ORG_CODE}
                </code>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* 에러 표시 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl space-y-2">
              <p className="font-bold text-red-700 text-sm">{error.title}</p>
              <div className="text-sm text-red-600 space-y-1">
                <p><span className="font-semibold">원인:</span> {error.reason}</p>
                <p><span className="font-semibold">해결:</span> {error.solution}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* 1. 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('register.nameLabel', '이름 (Name)')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="홍길동 / Hong Gildong"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-1">
                {t('register.nameHint', '여권상의 이름을 입력해주세요 (Enter your name as shown on your passport)')}
              </p>
            </div>

            {/* 2. 국가 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('register.countryLabel', '국가 선택 (Country)')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all appearance-none bg-white"
                  required
                >
                  <option value="">{t('register.countryPlaceholder', '국가를 선택해주세요 (Select your country)')}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.ko} ({c.en})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. 성별 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('register.genderLabel', '성별 (Gender)')} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.gender === 'male'
                    ? 'border-kk-navy bg-kk-cream text-kk-navy'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="font-medium">{t('register.genderMale', '남성 (Male)')}</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.gender === 'female'
                    ? 'border-kk-coral bg-kk-cream text-kk-coral'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="font-medium">{t('register.genderFemale', '여성 (Female)')}</span>
                </label>
              </div>
            </div>

            {/* 4. 출생년도 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('register.birthYearLabel', '출생년도 (Year of Birth)')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all appearance-none bg-white"
                  required
                >
                  <option value="">{t('register.birthYearPlaceholder', '예: 1995 (e.g. 1995)')}</option>
                  {birthYearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('register.emailLabel', '이메일 (Email)')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* 6. 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('register.passwordLabel', '비밀번호 (Password)')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all"
                  required
                />
              </div>
              {/* 비밀번호 강도 표시 */}
              {formData.password.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                  <span className={`flex items-center gap-1 ${pwCheck.hasLetter ? 'text-green-600' : 'text-gray-400'}`}>
                    {pwCheck.hasLetter ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    영문 (Letters)
                  </span>
                  <span className={`flex items-center gap-1 ${pwCheck.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                    {pwCheck.hasNumber ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    숫자 (Numbers)
                  </span>
                  <span className={`flex items-center gap-1 ${pwCheck.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                    {pwCheck.hasSpecial ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    특수문자 (Special)
                  </span>
                  <span className={`flex items-center gap-1 ${pwCheck.hasLength ? 'text-green-600' : 'text-gray-400'}`}>
                    {pwCheck.hasLength ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    8자 이상 (8+ chars)
                  </span>
                </div>
              )}
            </div>

            {/* 7. 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('register.passwordConfirmLabel', '비밀번호 확인 (Confirm Password)')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all ${
                    pwMismatch ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                  required
                />
              </div>
              {pwMismatch && (
                <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {t('register.passwordMismatch', '비밀번호가 일치하지 않습니다 (Passwords do not match)')}
                </p>
              )}
            </div>

            {/* 8. 기관코드 (강사 자동 매칭) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('register.orgCodeLabel', '기관코드 (Institution Code)')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="orgCode"
                  value={formData.orgCode}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      orgCode: e.target.value.toUpperCase(),
                    }));
                  }}
                  placeholder={`예: ${MASTER_ORG_CODE} (e.g. ${MASTER_ORG_CODE})`}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all ${
                    orgValidation?.valid ? 'border-green-400 bg-green-50' :
                    orgValidation && !orgValidation.valid ? 'border-red-400 bg-red-50' :
                    'border-gray-200'
                  }`}
                  required
                />
                {isValidatingOrg && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
              {orgValidation?.valid && (
                <div className="text-xs text-green-600 mt-1 ml-1 space-y-0.5">
                  <p className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {orgValidation.orgName}
                  </p>
                  {orgValidation.instructorName && (
                    <p className="ml-4 text-gray-500">
                      👤 담당 강사: {orgValidation.instructorName}
                    </p>
                  )}
                </div>
              )}
              {orgValidation && !orgValidation.valid && formData.orgCode.length >= 6 && (
                <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  유효하지 않은 기관코드 (Invalid institution code)
                </p>
              )}
            </div>

            {/* ─── v6 신규: 한국 생활 정보 ─────────────────────── */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 mb-3 mt-2">
                🇰🇷 한국 생활 정보 (Life in Korea)
              </p>
            </div>

            {/* 9. 한국어 수준 (TOPIK) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('register.koreanLevelLabel', '한국어 어느 정도 할 수 있어요? (How well do you speak Korean?)')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="koreanLevel"
                  value={formData.koreanLevel}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all appearance-none bg-white"
                  required
                >
                  <option value="">선택해주세요 (Please select)</option>
                  {KOREAN_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.ko} ({opt.en})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 10. 한국에 온 지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('register.yearsInKoreaLabel', '한국에 온 지 얼마나 됐어요? (How long have you been in Korea?)')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="yearsInKorea"
                  value={formData.yearsInKorea}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all appearance-none bg-white"
                  required
                >
                  <option value="">선택해주세요 (Please select)</option>
                  {YEARS_IN_KOREA_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.ko} ({opt.en})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 11. 비자 종류 (칩 UI) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <CreditCard className="w-4 h-4 inline mr-1 -mt-0.5 text-gray-400" />
                {t('register.visaTypeLabel', '어떤 비자가 있어요? (What visa do you have?)')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {VISA_OPTIONS.map((opt) => {
                  const selected = formData.visaType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, visaType: opt.value }))}
                      className={`px-2 py-2.5 rounded-xl border-2 text-center transition-all ${
                        selected
                          ? 'border-kk-red bg-red-50 text-kk-red'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                      }`}
                    >
                      <div className="font-bold text-sm">{opt.ko}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 약관/개인정보 동의 */}
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer border-b border-gray-200 pb-2.5 mb-1">
                <input
                  type="checkbox"
                  checked={agreeTerms && agreePrivacy && agreeMarketing}
                  onChange={toggleAllAgree}
                  className="w-4 h-4 accent-kk-red"
                />
                <span className="text-sm font-bold text-gray-900">
                  전체 동의 (Agree to all)
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-kk-red"
                />
                <span className="text-xs text-gray-700 flex-1">
                  <span className="text-red-500 font-bold">[필수]</span>{' '}
                  <Link to="/terms" target="_blank" className="underline hover:text-kk-red">
                    이용약관 (Terms of Service)
                  </Link>
                  에 동의합니다
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-kk-red"
                />
                <span className="text-xs text-gray-700 flex-1">
                  <span className="text-red-500 font-bold">[필수]</span>{' '}
                  <Link to="/privacy" target="_blank" className="underline hover:text-kk-red">
                    개인정보처리방침 (Privacy Policy)
                  </Link>
                  에 동의합니다
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-kk-red"
                />
                <span className="text-xs text-gray-500 flex-1">
                  <span className="text-gray-400 font-bold">[선택]</span>{' '}
                  마케팅 정보 수신에 동의합니다 (Marketing updates — optional)
                </span>
              </label>
            </div>

            {/* 가입 버튼 */}
            <button
              type="submit"
              disabled={
                isLoading ||
                pwMismatch ||
                !agreedAll ||
                (formData.password.length > 0 && !isStrongPassword(formData.password))
              }
              className="w-full py-3.5 bg-kk-red hover:bg-kk-red-deep disabled:bg-kk-peach text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('register.submitButton', '가입하기 (Sign Up)')
              )}
            </button>
          </div>

          {/* 로그인 링크 */}
          <p className="mt-6 text-center text-sm text-gray-500">
            {t('register.loginLink', '이미 계정이 있으신가요? 로그인 (Already have an account? Log in)').split('?')[0]}?{' '}
            <Link to="/login" className="text-kk-red font-semibold hover:underline">
              {t('auth.loginLink', '로그인')}
            </Link>
          </p>
        </form>

        {/* 홈으로 */}
        <p className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← {t('auth.backToHome', '홈으로 돌아가기')}
          </Link>
        </p>
      </div>
    </div>
  );
}
