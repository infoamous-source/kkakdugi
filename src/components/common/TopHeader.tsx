import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, User, LogIn, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const languages = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'mn', label: 'Монгол', flag: '🇲🇳' },
  { code: 'uz', label: 'Oʻzbekcha', flag: '🇺🇿' },
  { code: 'ne', label: 'नेपाली', flag: '🇳🇵' },
  { code: 'tl', label: 'Filipino', flag: '🇵🇭' },
  { code: 'my', label: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'km', label: 'ភាសាខ្មែរ', flag: '🇰🇭' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export default function TopHeader() {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  // 클릭 외부 감지
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="h-16 bg-kk-bg border-b border-kk-warm flex items-center justify-end px-6 gap-4">
      {/* 언어 선택 */}
      <div ref={langRef} className="relative">
        <button
          onClick={() => setLangOpen(!langOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-kk-cream/60 transition-colors text-sm font-medium text-kk-brown/60"
        >
          <Globe className="w-4 h-4" />
          <span>{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
        </button>

        {langOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-kk-warm py-2 min-w-[180px] max-h-[400px] overflow-y-auto z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-kk-cream/40 transition-colors ${
                  lang.code === i18n.language ? 'text-kk-red-deep font-semibold bg-kk-cream' : 'text-kk-brown/70'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 로그인/회원가입 또는 사용자 메뉴 */}
      {isAuthenticated && user ? (
        <div ref={userRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-kk-cream/60 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-kk-cream to-kk-peach rounded-full flex items-center justify-center border border-kk-warm">
              <span className="text-kk-brown text-sm font-bold">{user.name[0].toUpperCase()}</span>
            </div>
            <span className="text-sm font-medium text-kk-brown hidden sm:inline">{user.name}</span>
            <ChevronDown className={`w-4 h-4 text-kk-brown/40 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-kk-warm py-2 min-w-[180px] z-50">
              <div className="px-4 py-2 border-b border-kk-warm">
                <p className="text-sm font-semibold text-kk-brown">{user.name}</p>
                <p className="text-xs text-kk-brown/40">{user.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                  user.role === 'instructor' ? 'bg-kk-red/10 text-kk-red-deep' :
                  user.role === 'ceo' ? 'bg-purple-100 text-purple-700' :
                  'bg-kk-cream text-kk-brown'
                }`}>
                  {user.role === 'instructor' ? t('header.instructor') : user.role === 'ceo' ? 'CEO' : t('header.student')}
                </span>
              </div>

              {(user.role === 'instructor' || user.role === 'ceo') && (
                <button
                  onClick={() => { navigate(user.role === 'ceo' ? '/ceo' : '/admin'); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-kk-brown/70 hover:bg-kk-cream/40 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {t('header.dashboard')}
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-kk-red hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('header.logout')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-kk-brown/60 hover:bg-kk-cream/60 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>{t('header.login')}</span>
          </button>
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-kk-red hover:bg-kk-red-deep transition-colors"
          >
            <User className="w-4 h-4" />
            <span>{t('header.register')}</span>
          </button>
        </div>
      )}
    </header>
  );
}
