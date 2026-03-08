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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // 선생님코드 실시간 검증
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

  // 기관코드 실시간 검증
  const [orgValidation, setOrgValidation] = useState<{ valid: boolean; orgName: string | null } | null>(null);
  const [isValidatingOrg, setIsValidatingOrg] = useState(false);

  useEffect(() => {
    if (formData.orgCode.length < 6) {
      setOrgValidation(null);
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

    setIsLoading(true);
    try {
      // 선생님코드 유효성 검증
      const codeResult = await validateInstructorCode(formData.instructorCode);
      if (!codeResult.valid) {
        setError({
          title: '선생님코드 오류 (Teacher Code Error)',
          reason: '유효하지 않은 선생님코드입니다 (Invalid teacher code)',
          solution: '선생님에게 올바른 코드를 확인해주세요 (Please check the correct code with your teacher)',
        });
        setIsLoading(false);
        return;
      }

      // 기관코드 유효성 검증
      const orgResult = await validateOrgCode(formData.orgCode);
      if (!orgResult.valid) {
        setError({
          title: '기관코드 오류 (Institution Code Error)',
          reason: '유효하지 않은 기관코드입니다 (Invalid institution code)',
          solution: '선생님에게 올바른 기관코드를 확인해주세요 (Please check the correct code with your teacher)',
        });
        setIsLoading(false);
        return;
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

            {/* 8. 강사코드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('register.instructorCodeLabel', '선생님코드 (Teacher Code)')} <span className="text-red-500">*</span>
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
                  placeholder={t('register.instructorCodePlaceholder', '선생님에게 받은 코드를 입력하세요 (Enter the code from your teacher)')}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all ${
                    instructorValidation?.valid ? 'border-green-400 bg-green-50' :
                    instructorValidation && !instructorValidation.valid ? 'border-red-400 bg-red-50' :
                    'border-gray-200'
                  }`}
                  required
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
                  placeholder={t('register.orgCodePlaceholder', '기관에서 받은 코드를 입력하세요 (Enter the code from your institution)')}
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

            {/* 가입 버튼 */}
            <button
              type="submit"
              disabled={isLoading || pwMismatch || (formData.password.length > 0 && !isStrongPassword(formData.password))}
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
