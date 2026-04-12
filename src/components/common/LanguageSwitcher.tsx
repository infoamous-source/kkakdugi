/**
 * 모국어 토글 버튼 (PRD 가입 폼 v6 — 결정 #7)
 *
 * TOPIK 0-2 사용자도 가입 폼을 이해할 수 있도록
 * 화면 전체 언어를 한국어 ↔ 영어 (+ 추후 다국어)로 전환한다.
 *
 * supportedLngs에 새 언어를 추가하면 자동으로 토글 옵션에 나타남.
 */

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGUAGE_LABELS: Record<string, { native: string; emoji: string }> = {
  ko: { native: '한국어', emoji: '🇰🇷' },
  en: { native: 'English', emoji: '🇺🇸' },
  vi: { native: 'Tiếng Việt', emoji: '🇻🇳' },
  zh: { native: '中文', emoji: '🇨🇳' },
  th: { native: 'ภาษาไทย', emoji: '🇹🇭' },
  ja: { native: '日本語', emoji: '🇯🇵' },
  tl: { native: 'Filipino', emoji: '🇵🇭' },
  uz: { native: "O'zbek", emoji: '🇺🇿' },
  km: { native: 'ខ្មែរ', emoji: '🇰🇭' },
  mn: { native: 'Монгол', emoji: '🇲🇳' },
  id: { native: 'Bahasa', emoji: '🇮🇩' },
  ne: { native: 'नेपाली', emoji: '🇳🇵' },
  my: { native: 'မြန်မာ', emoji: '🇲🇲' },
};

interface Props {
  /** 컴팩트 모드: 아이콘만 (모바일 상단 등) */
  compact?: boolean;
  /** 표시할 위치 스타일 */
  className?: string;
}

export default function LanguageSwitcher({ compact, className }: Props) {
  const { i18n } = useTranslation();

  // i18n에서 지원하는 언어 목록 가져오기
  const supportedLngs = (i18n.options.supportedLngs as string[] ?? ['ko', 'en']).filter(
    (l) => l !== 'cimode',
  );

  const currentLng = i18n.language?.split('-')[0] ?? 'ko';
  const currentLabel = LANGUAGE_LABELS[currentLng] ?? LANGUAGE_LABELS.ko;

  // 2개 언어: 토글 (클릭 시 바로 전환)
  // 3개 이상: 순환 (클릭할 때마다 다음 언어)
  const handleToggle = () => {
    const currentIdx = supportedLngs.indexOf(currentLng);
    const nextIdx = (currentIdx + 1) % supportedLngs.length;
    i18n.changeLanguage(supportedLngs[nextIdx]);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${className ?? ''}`}
        title={`현재: ${currentLabel.native} — 클릭하면 다른 언어로 바꿔요`}
      >
        <Globe className="w-5 h-5 text-gray-600" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all ${className ?? ''}`}
      title={`현재: ${currentLabel.native} — 클릭하면 다른 언어로 바꿔요`}
    >
      <span className="text-lg">{currentLabel.emoji}</span>
      <span className="text-sm font-medium text-gray-700">{currentLabel.native}</span>
      <Globe className="w-4 h-4 text-gray-400" />
    </button>
  );
}
