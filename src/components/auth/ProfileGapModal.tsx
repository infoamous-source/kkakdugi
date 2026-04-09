import { useState, useMemo } from 'react';
import { Loader2, Languages, Clock, CreditCard, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../services/profileService';

/**
 * 프로필 강제 보강 모달 (가입 폼 v6 — PRD: docs/prd-signup-form-v5.md)
 *
 * 목적: 기존 사용자 중 v6 신규 필수 필드(korean_level/years_in_korea/visa_type)가
 *       누락된 사람을 첫 로그인 시 막아서 강제 입력받음.
 *
 * 정책: 닫기 버튼 없음, 건너뛰기 없음. 입력 완료까지 사이트 사용 차단.
 *       CEO/강사는 제외(학생 전용).
 *
 * 표시 조건: user.role === 'student' && (korean_level || years_in_korea || visa_type 중 하나라도 null)
 */

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
  { value: 'none',  ko: '없음', desc: 'No visa' },
] as const;

interface ProfileGapModalProps {
  missing: {
    koreanLevel: boolean;
    yearsInKorea: boolean;
    visaType: boolean;
  };
}

export default function ProfileGapModal({ missing }: ProfileGapModalProps) {
  const { user, refreshUser } = useAuth();
  const [koreanLevel, setKoreanLevel] = useState('');
  const [yearsInKorea, setYearsInKorea] = useState('');
  const [visaType, setVisaType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    if (missing.koreanLevel && !koreanLevel) return false;
    if (missing.yearsInKorea && !yearsInKorea) return false;
    if (missing.visaType && !visaType) return false;
    return true;
  }, [missing, koreanLevel, yearsInKorea, visaType]);

  const handleSubmit = async () => {
    if (!user || !canSubmit) return;
    setError('');
    setIsLoading(true);
    try {
      const updates: Record<string, string> = {};
      if (missing.koreanLevel) updates.korean_level = koreanLevel;
      if (missing.yearsInKorea) updates.years_in_korea = yearsInKorea;
      if (missing.visaType) updates.visa_type = visaType;

      const success = await updateProfile(user.id, updates as never);
      if (!success) {
        setError('저장에 실패했어요. 다시 시도해주세요 (Failed to save. Please try again)');
        setIsLoading(false);
        return;
      }
      await refreshUser();
    } catch (e) {
      console.error('[ProfileGapModal] update error:', e);
      setError('오류가 발생했어요 (An error occurred)');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        {/* 헤더 — 닫기 버튼 없음 (강제) */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">🇰🇷</div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                추가 정보가 필요해요
              </h2>
              <p className="text-xs text-gray-500">
                Additional information needed
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            더 정확한 맞춤 학습을 위해 몇 가지만 알려주세요.
            <br />
            <span className="text-xs text-gray-400">
              Please share a few things for personalized learning.
            </span>
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* 에러 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {error}
            </div>
          )}

          {/* 1. 한국어 수준 */}
          {missing.koreanLevel && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Languages className="w-4 h-4 inline mr-1 -mt-0.5 text-gray-400" />
                한국어 어느 정도 할 수 있어요? <span className="text-red-500">*</span>
                <span className="block text-[11px] text-gray-400 font-normal mt-0.5">
                  How well do you speak Korean?
                </span>
              </label>
              <select
                value={koreanLevel}
                onChange={(e) => setKoreanLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent appearance-none bg-white"
              >
                <option value="">선택해주세요 (Please select)</option>
                {KOREAN_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.ko} ({opt.en})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. 한국에 온 지 */}
          {missing.yearsInKorea && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Clock className="w-4 h-4 inline mr-1 -mt-0.5 text-gray-400" />
                한국에 온 지 얼마나 됐어요? <span className="text-red-500">*</span>
                <span className="block text-[11px] text-gray-400 font-normal mt-0.5">
                  How long have you been in Korea?
                </span>
              </label>
              <select
                value={yearsInKorea}
                onChange={(e) => setYearsInKorea(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent appearance-none bg-white"
              >
                <option value="">선택해주세요 (Please select)</option>
                {YEARS_IN_KOREA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.ko} ({opt.en})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. 비자 (칩 UI) */}
          {missing.visaType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <CreditCard className="w-4 h-4 inline mr-1 -mt-0.5 text-gray-400" />
                어떤 비자가 있어요? <span className="text-red-500">*</span>
                <span className="block text-[11px] text-gray-400 font-normal mt-0.5">
                  What visa do you have?
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {VISA_OPTIONS.map((opt) => {
                  const selected = visaType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setVisaType(opt.value)}
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
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="px-6 pb-6 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            className="w-full py-3.5 bg-kk-red hover:bg-kk-red-deep disabled:bg-kk-peach text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                저장하고 시작하기 (Save & Start)
              </>
            )}
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-3">
            입력하지 않으면 학습을 시작할 수 없어요
            <br />
            You cannot start learning without filling this out
          </p>
        </div>
      </div>
    </div>
  );
}

/** 사용자 프로필에 v6 필수 필드가 누락됐는지 체크하는 헬퍼 */
export function computeProfileGap(profile: {
  korean_level?: string | null;
  years_in_korea?: string | null;
  visa_type?: string | null;
} | null): { hasGap: boolean; missing: ProfileGapModalProps['missing'] } {
  if (!profile) return { hasGap: false, missing: { koreanLevel: false, yearsInKorea: false, visaType: false } };
  const missing = {
    koreanLevel: !profile.korean_level,
    yearsInKorea: !profile.years_in_korea,
    visaType: !profile.visa_type,
  };
  const hasGap = missing.koreanLevel || missing.yearsInKorea || missing.visaType;
  return { hasGap, missing };
}
