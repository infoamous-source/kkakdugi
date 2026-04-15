import { generateText, isGeminiEnabled } from './geminiClient';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';

export async function generateDashboardAnalysis(input: {
  entries: Array<{ month: string; channel: string; adSpend: number; revenue: number }>;
  goalROAS?: number;
}, profile?: UserProfileView | null): Promise<string> {
  if (!isGeminiEnabled()) return getMockAnalysis();

  const systemPrompt = profile ? buildSystemPrompt(profile, {
    toolName: '마케팅 대시보드 프로',
    toolPurpose: '월별 광고 성과 데이터를 심층 분석하고 개선 전략을 제시한다.',
    bilingualFeedback: true,
    extraInstructions: [
      '당신은 한국 퍼포먼스 마케팅 10년차 전문가예요.',
      '데이터 기반으로 구체적이고 실행 가능한 인사이트를 제공하라.',
      input.goalROAS ? `목표 ROAS: ${input.goalROAS}. 달성도와 개선 방향을 포함하라.` : '',
      '마크다운 형식으로 출력하라.',
    ].filter(Boolean).join(' '),
  }) : '';

  const dataStr = input.entries.map(e =>
    `${e.month} ${e.channel}: 광고비 ${e.adSpend.toLocaleString()}원, 매출 ${e.revenue.toLocaleString()}원, ROAS ${e.adSpend > 0 ? (e.revenue / e.adSpend).toFixed(1) : 0}`,
  ).join('\n');
  const userPrompt = `## 광고 성과 데이터\n${dataStr}\n\n심층 분석과 개선 전략을 마크다운으로 작성해주세요.`;

  try {
    const text = await generateText(systemPrompt ? `${systemPrompt}\n\n---\n\n${userPrompt}` : userPrompt);
    return text || getMockAnalysis();
  } catch {
    return getMockAnalysis();
  }
}

function getMockAnalysis(): string {
  return `## 분석 요약\n\n전체 ROAS는 2.3으로 본전 수준입니다.\n\n### 채널별 분석\n- **인스타그램**: 가장 효율적 (ROAS 3.1)\n- **네이버**: 개선 필요 (ROAS 1.5)\n\n### 추천 전략\n1. 인스타그램 예산 30% 증액\n2. 네이버 키워드 광고 소재 교체\n3. 카카오 채널 테스트 시작`;
}
