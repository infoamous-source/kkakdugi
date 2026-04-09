import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2, Copy, Download, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../lib/userProfile';
import { useResumeBuilderSession } from '../../hooks/useResumeBuilderSession';
import { generateKResume } from '../../services/career/kResumeService';
import type { KResume } from '../../types/career/resume';

/**
 * K-이력서 빌더 페이지
 *
 * 자소서 빌더 세션이 있으면 그 데이터를 재활용해서 한국식 이력서 생성.
 * 세션이 없으면 자소서 빌더 먼저 진행 유도.
 */
export default function KResumePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = useUserProfile();
  const { session, updateSession } = useResumeBuilderSession(user?.id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!profile?.isReady) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">
        프로필을 먼저 완성해주세요 (Please complete your profile first)
      </div>
    );
  }

  const hasBuilderSession =
    session.resultStrengths.length > 0 && session.interviewAnswers.length > 0;
  const latestResume: KResume | undefined = session.kResumes?.[session.kResumes.length - 1];

  const handleGenerate = async () => {
    if (!hasBuilderSession) {
      setError('먼저 자소서 빌더에서 강점 찾기와 인터뷰를 해주세요.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const acceptedStrengths = session.resultStrengths.filter(
        (r) => !session.rejectedResultIds.includes(r.id),
      );
      const result = await generateKResume({
        profile,
        strengths: acceptedStrengths,
        interviewAnswers: session.interviewAnswers,
        initialProfile: session.initialProfile,
        target: session.resumeTarget
          ? {
              company: session.resumeTarget.company,
              jobTitle: session.resumeTarget.jobTitle,
              industry: session.resumeTarget.industry,
            }
          : undefined,
      });

      if (!result) {
        setError('이력서 생성에 실패했어요. 다시 시도해주세요.');
      } else {
        updateSession({
          kResumes: [...(session.kResumes ?? []), result],
        });
      }
    } catch (e) {
      console.error('[KResumePage] generate error:', e);
      setError('오류가 발생했어요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAll = async () => {
    if (!latestResume) return;
    const text = formatResumeAsText(latestResume);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey('all');
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // 무시
    }
  };

  const handleDownload = () => {
    if (!latestResume) return;
    const text = formatResumeAsText(latestResume);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `이력서_${latestResume.personal.name ?? 'resume'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      {/* 상단 바 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/track/career')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </button>
      </div>

      {/* 헤더 */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5 mb-4">
        <FileText className="w-6 h-6 text-emerald-600 mb-2" />
        <h1 className="text-xl font-bold text-gray-800 mb-1">K-이력서 빌더</h1>
        <p className="text-sm text-gray-600">
          자소서 빌더에서 한 인터뷰로 한국식 이력서를 만들어요
        </p>
      </div>

      {/* 세션 없음 안내 */}
      {!hasBuilderSession && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-600 mb-2" />
          <p className="text-sm text-amber-800 font-medium mb-1">
            먼저 자소서 빌더를 완료해주세요
          </p>
          <p className="text-xs text-amber-700 mb-3">
            강점 찾기와 STAR 인터뷰가 끝나면 이력서도 자동으로 만들 수 있어요.
          </p>
          <button
            type="button"
            onClick={() => navigate('/career/resume-builder')}
            className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg"
          >
            자소서 빌더로 가기
          </button>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* 생성 버튼 */}
      {hasBuilderSession && !latestResume && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 mb-4"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              이력서를 만들고 있어요...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              이력서 만들기
            </>
          )}
        </button>
      )}

      {/* 이력서 결과 */}
      {latestResume && (
        <div className="space-y-4">
          {/* 인적사항 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">
              👤 인적사항
            </h3>
            <div className="grid grid-cols-2 gap-y-1.5 text-sm">
              <InfoRow label="이름" value={latestResume.personal.name} />
              <InfoRow label="국적" value={latestResume.personal.country} />
              <InfoRow label="비자" value={latestResume.personal.visaType} />
              <InfoRow label="한국 체류" value={latestResume.personal.yearsInKorea} />
              <InfoRow label="한국어" value={latestResume.personal.koreanLevel} />
            </div>
          </section>

          {/* 자기소개 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">
              💬 자기소개
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {latestResume.summary.body}
            </p>
            {latestResume.summary.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {latestResume.summary.keywords.map((k, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full"
                  >
                    #{k}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* 학력 */}
          {latestResume.education?.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">
                🎓 학력
              </h3>
              <div className="space-y-2">
                {latestResume.education.map((edu) => (
                  <div key={edu.id} className="text-sm">
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium text-gray-800">{edu.schoolName}</span>
                      <span className="text-xs text-gray-400">
                        {edu.country === 'home' ? '🌏 모국' : '🇰🇷 한국'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {edu.degree}
                      {edu.major ? ` · ${edu.major}` : ''}
                      {edu.startYear && edu.endYear ? ` · ${edu.startYear}~${edu.endYear}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 경력 */}
          {latestResume.career?.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">
                💼 경력
              </h3>
              <div className="space-y-3">
                {latestResume.career.map((c) => (
                  <div key={c.id} className="text-sm">
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium text-gray-800">
                        {c.company} · {c.role}
                      </span>
                      <span className="text-xs text-gray-400">
                        {c.country === 'home' ? '🌏 모국' : '🇰🇷 한국'}
                      </span>
                    </div>
                    {c.startYear && (
                      <div className="text-xs text-gray-500 mb-1">
                        {c.startYear}~{c.endYear ?? '현재'}
                      </div>
                    )}
                    {c.achievements?.length > 0 && (
                      <ul className="text-xs text-gray-600 space-y-0.5 mt-1 ml-2">
                        {c.achievements.map((a, i) => (
                          <li key={i}>• {a}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 자격증 */}
          {latestResume.certifications?.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">
                📜 자격·어학
              </h3>
              <div className="space-y-1.5">
                {latestResume.certifications.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-medium text-gray-800">{c.name}</span>
                    {c.detail && <span className="text-xs text-gray-500 ml-2">· {c.detail}</span>}
                    {c.year && <span className="text-xs text-gray-400 ml-2">({c.year})</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 액션 바 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="py-3 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
            >
              <Copy className="w-4 h-4" />
              {copiedKey === 'all' ? '복사됨 ✓' : '전체 복사'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="py-3 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              텍스트 저장
            </button>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 border border-emerald-300 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-50"
          >
            {isGenerating ? '다시 만드는 중...' : '🔄 다시 만들기'}
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm text-gray-800">{value || '-'}</div>
    </>
  );
}

function formatResumeAsText(resume: KResume): string {
  const lines: string[] = [];
  lines.push('===========================');
  lines.push(`이력서 (Resume)`);
  lines.push('===========================');
  lines.push('');
  lines.push('[인적사항]');
  lines.push(`이름: ${resume.personal.name}`);
  if (resume.personal.country) lines.push(`국적: ${resume.personal.country}`);
  if (resume.personal.visaType) lines.push(`비자: ${resume.personal.visaType}`);
  if (resume.personal.yearsInKorea) lines.push(`한국 체류: ${resume.personal.yearsInKorea}`);
  if (resume.personal.koreanLevel) lines.push(`한국어: ${resume.personal.koreanLevel}`);
  lines.push('');
  lines.push('[자기소개]');
  lines.push(resume.summary.body);
  if (resume.summary.keywords?.length) {
    lines.push(`핵심 키워드: ${resume.summary.keywords.join(', ')}`);
  }
  lines.push('');
  if (resume.education?.length) {
    lines.push('[학력]');
    resume.education.forEach((e) => {
      lines.push(
        `- ${e.schoolName} (${e.country === 'home' ? '모국' : '한국'}) · ${e.degree}${
          e.major ? ' · ' + e.major : ''
        }${e.startYear ? ` · ${e.startYear}~${e.endYear ?? ''}` : ''}`,
      );
    });
    lines.push('');
  }
  if (resume.career?.length) {
    lines.push('[경력]');
    resume.career.forEach((c) => {
      lines.push(
        `- ${c.company} · ${c.role} (${c.country === 'home' ? '모국' : '한국'})${
          c.startYear ? ` · ${c.startYear}~${c.endYear ?? '현재'}` : ''
        }`,
      );
      c.achievements?.forEach((a) => lines.push(`  • ${a}`));
    });
    lines.push('');
  }
  if (resume.certifications?.length) {
    lines.push('[자격·어학]');
    resume.certifications.forEach((c) => {
      lines.push(`- ${c.name}${c.detail ? ' · ' + c.detail : ''}${c.year ? ` (${c.year})` : ''}`);
    });
  }
  lines.push('');
  lines.push(`생성일: ${new Date(resume.generatedAt).toLocaleString('ko-KR')}`);
  return lines.join('\n');
}
