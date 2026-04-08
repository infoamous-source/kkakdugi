import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Mail,
  Lock,
  Globe,
  Calendar,
  GraduationCap,
  Tag,
  UserPlus,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { parseAuthError, type AuthError } from '../../utils/authErrors';
import { validateInstructorCode } from '../../services/profileService';
import { validateOrgCode } from '../../services/organizationService';
import { COUNTRIES } from '../../data/countries';

// mockup 확정안 P0-1: 외국인 현장 가입용 마스터 기관코드
// 이 코드는 DB 검증을 우회하며, 30명 학생이 동일 코드로 가입 → 강사가 나중에 분반
const MASTER_ORG_CODE = 'KKAKDUGI2026';

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
    instructorCode: '',
    orgCode: '',
    authCode: '',
  });

  // P0-3: 약관/개인정보처리방침 동의 (필수 2개 + 선택 1개)
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

  // authCode가 "체리" 또는 "딸기"이면 특수 역할 가입
  const isCeoSignup = formData.authCode === '체리';
  const isInstructorSignup = formData.authCode === '딸기';
  const isSpecialRole = isCeoSignup || isInstructorSignup;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // 선생님코드 실시간 검증 (선택 사항 — 비워두면 검증 생략)
  const [instructorValidation, setInstructorValidation] = useState<{ valid: boolean; instructorName: string | null } | null>(null);
  const [isValidatingInstructor, setIsValidatingInstructor] = useState(false);

  useEffect(() => {
    if (formData.instructorCode.length < 2) {
      setInstructorValidation(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsValidatingInstructor(true);
      const result = await validateInstructorCode(formData.instructorCode);
      setInstructorValidation(result);
      setIsValidatingInstructor(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.instructorCode]);

  // 기관코드 실시간 검증 (마스터 코드는 DB 검증 우회)
  const [orgValidation, setOrgValidation] = useState<{ valid: boolean; orgName: string | null } | null>(null);
  const [isValidatingOrg, setIsValidatingOrg] = useState(false);

  useEffect(() => {
    if (formData.orgCode.length < 6) {
      setOrgValidation(null);
      return;
    }
    // 마스터 코드 즉시 통과
    if (formData.orgCode.toUpperCase() === MASTER_ORG_CODE) {
      setOrgValidation({ valid: true, orgName: '깍두기학교 · Onsite (KKAKDUGI School)' });
      setIsValidatingOrg(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsValidatingOrg(true);
      const result = await validateOrgCode(formData.orgCode);
      setOrgValidation(result);
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

    // P0-3: 약관/개인정보 필수 동의 확인
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
      // 특수 역할이 아닌 경우에만 기관코드 검증 (선생님코드는 선택)
      if (!isSpecialRole) {
        // 선생님코드는 선택사항 — 입력했을 때만 검증
        if (formData.instructorCode.trim().length > 0) {
          const codeResult = await validateInstructorCode(formData.instructorCode);
          if (!codeResult.valid) {
            setError({
              title: '선생님코드 오류 (Teacher Code Error)',
              reason: '유효하지 않은 선생님코드입니다 (Invalid teacher code)',
              solution: '비워두거나 올바른 코드를 입력하세요 (Leave blank or enter a valid code)',
            });
            setIsLoading(false);
            return;
          }
        }

        // 기관코드 유효성 검증 (마스터 코드는 우회)
        const isMasterOrgCode = formData.orgCode.toUpperCase() === MASTER_ORG_CODE;
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
        }
      }

      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        instructorCode: formData.instructorCode,
        orgCode: formData.orgCode,
        country: formData.country,
        gender: formData.gender as 'male' | 'female',
        birthYear: parseInt(formData.birthYear, 10),
        authCode: formData.authCode || undefined,
      });
      navigate(isCeoSignup ? '/ceo' : isInstructorSignup ? '/admin' : '/register-complete');
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

        {/* 현장 학생 안내 배너 (P0-1 외국인 친화 가입) */}
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
              <p className="text-[11px] text-amber-700 mt-2">
                💡 선생님코드는 비워두셔도 돼요 (Teacher code is optional)
              </p>
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

            {/* 8. 강사코드 (선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('register.instructorCodeLabel', '선생님코드 (Teacher Code)')}{' '}
                <span className="text-gray-400 text-xs font-normal">선택 (Optional)</span>
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="instructorCode"
                  value={formData.instructorCode}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      instructorCode: e.target.value.toUpperCase(),
                    }));
                  }}
                  placeholder="비워두셔도 돼요 (Leave blank if unsure)"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all ${
                    instructorValidation?.valid ? 'border-green-400 bg-green-50' :
                    instructorValidation && !instructorValidation.valid ? 'border-red-400 bg-red-50' :
                    'border-gray-200'
                  }`}
                />
                {isValidatingInstructor && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
              {instructorValidation?.valid && (
                <p className="text-xs text-green-600 mt-1 ml-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {instructorValidation.instructorName}
                </p>
              )}
              {instructorValidation && !instructorValidation.valid && formData.instructorCode.length >= 2 && (
                <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {t('register.invalidInstructorCode', '유효하지 않은 선생님코드 (Invalid teacher code)')}
                </p>
              )}
            </div>

            {/* 9. 기관코드 */}
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
                <p className="text-xs text-green-600 mt-1 ml-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {orgValidation.orgName}
                </p>
              )}
              {orgValidation && !orgValidation.valid && formData.orgCode.length >= 6 && (
                <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  유효하지 않은 기관코드 (Invalid institution code)
                </p>
              )}
            </div>

            {/* 10. 인증코드 (선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                인증코드 (Auth Code) <span className="text-gray-400 text-xs">선택사항</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="authCode"
                  value={formData.authCode}
                  onChange={handleChange}
                  placeholder="특수 인증코드 (선택)"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all ${
                    isCeoSignup ? 'border-purple-400 bg-purple-50' :
                    isInstructorSignup ? 'border-green-400 bg-green-50' :
                    'border-gray-200'
                  }`}
                />
              </div>
              {isCeoSignup && (
                <p className="text-xs text-purple-600 mt-1 ml-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  CEO 계정으로 가입합니다
                </p>
              )}
              {isInstructorSignup && (
                <p className="text-xs text-green-600 mt-1 ml-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  강사 계정으로 가입합니다
                </p>
              )}
            </div>

            {/* P0-3: 약관/개인정보 동의 체크박스 */}
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
