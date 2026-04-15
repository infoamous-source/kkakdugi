import { generateText, isGeminiEnabled } from './geminiClient';
import { safeParseJSON } from './jsonHelper';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';

export interface MarketResearchReport {
  marketSize: string;
  competitors: Array<{ name: string; strengths: string; weaknesses: string; positioning: string }>;
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  opportunities: string[];
  targetPersona: string;
  entryStrategy: string;
}

export async function generateMarketResearch(input: {
  keyword: string;
  targetAge?: string;
  targetGender?: string;
  itemType?: string;
  existingData?: { competitors?: string; painPoints?: string; keywords?: string };
}, profile?: UserProfileView | null): Promise<{ report: MarketResearchReport | null; isMock: boolean }> {
  if (isGeminiEnabled()) {
    const existingData = input.existingData;
    const systemPrompt = profile ? buildSystemPrompt(profile, {
      toolName: '시장 리서치 프로',
      toolPurpose: '키워드 기반 심화 시장 분석 6섹션(시장규모/경쟁사/SWOT/기회/타겟/전략)을 생성한다.',
      bilingualFeedback: true,
      extraInstructions: [
        '당신은 한국에서 10년 이상 소비재/서비스 시장을 분석한 실전 시장분석가예요.',
        '한국 시장에 실제 존재하는 브랜드와 데이터만 사용하라.',
        'JSON 형식으로 출력하라. 마크다운 텍스트 금지.',
        '각 섹션은 구체적이고 실행 가능한 인사이트를 담아야 한다.',
        existingData ? `학생이 학교에서 이미 분석한 데이터: 경쟁사=${existingData.competitors || '없음'}, 고객고충=${existingData.painPoints || '없음'}, 연관키워드=${existingData.keywords || '없음'}. 이 데이터를 기반으로 심화 분석하라.` : '',
      ].filter(Boolean).join(' '),
    }) : '';

    const userPrompt = `키워드: ${input.keyword}\n타겟: ${input.targetAge || '전체'} ${input.targetGender || '전체'}\n상품유형: ${input.itemType || '일반'}\n\nJSON 출력: { "marketSize": "시장 규모 분석", "competitors": [{"name":"","strengths":"","weaknesses":"","positioning":""}], "swot": {"strengths":[],"weaknesses":[],"opportunities":[],"threats":[]}, "opportunities": ["기회1"], "targetPersona": "타겟 상세", "entryStrategy": "진입 전략" }`;

    try {
      const text = await generateText(systemPrompt ? `${systemPrompt}\n\n---\n\n${userPrompt}` : userPrompt);
      if (text) {
        const parsed = safeParseJSON(text) as MarketResearchReport;
        if (parsed?.marketSize) return { report: parsed, isMock: false };
      }
    } catch (e) {
      console.error('[proMarketResearch] AI failed:', e);
    }
  }

  return { report: getMockReport(input.keyword), isMock: true };
}

export async function regenerateSection(
  sectionKey: keyof MarketResearchReport,
  currentReport: MarketResearchReport,
  input: { keyword: string },
  profile?: UserProfileView | null,
): Promise<string | null> {
  if (!isGeminiEnabled()) return null;

  const systemPrompt = profile ? buildSystemPrompt(profile, {
    toolName: '시장 리서치 프로 (섹션 재생성)',
    toolPurpose: `시장 분석 리포트의 "${sectionKey}" 섹션만 새로 작성한다.`,
    bilingualFeedback: true,
  }) : '';

  const userPrompt = `키워드: ${input.keyword}\n현재 리포트 맥락: ${JSON.stringify(currentReport).slice(0, 500)}\n\n"${sectionKey}" 섹션만 새로 작성해줘. 텍스트만 반환 (JSON X).`;

  try {
    return await generateText(systemPrompt ? `${systemPrompt}\n\n---\n\n${userPrompt}` : userPrompt);
  } catch {
    return null;
  }
}

function getMockReport(keyword: string): MarketResearchReport {
  return {
    marketSize: `${keyword} 관련 한국 시장은 약 5,000억 원 규모로 추정됩니다. (Market size estimated at ~500B KRW) 매년 12%씩 성장 중이며, 온라인 채널이 전체의 60%를 차지합니다.`,
    competitors: [
      { name: '경쟁사 A', strengths: '높은 브랜드 인지도', weaknesses: '가격이 비쌈', positioning: '프리미엄' },
      { name: '경쟁사 B', strengths: '가격 경쟁력', weaknesses: '품질 이슈', positioning: '가성비' },
      { name: '경쟁사 C', strengths: 'SNS 마케팅 강함', weaknesses: '오프라인 부재', positioning: 'MZ 타겟' },
    ],
    swot: {
      strengths: ['차별화된 제품', '낮은 초기 비용'],
      weaknesses: ['낮은 인지도', '유통 채널 부족'],
      opportunities: ['온라인 시장 성장', '해외 직구 수요'],
      threats: ['대기업 진입', '원자재 가격 상승'],
    },
    opportunities: ['틈새 시장: 20대 여성 친환경 제품', '크로스보더 커머스 기회', '인플루언서 협업 효과적'],
    targetPersona: '25-34세 여성, 서울 거주, SNS 활발, 월 가처분 소득 200만원, 건강/친환경에 관심 높음',
    entryStrategy: '1단계: 인스타그램 콘텐츠 마케팅으로 인지도 확보 (3개월)\n2단계: 네이버 스마트스토어 입점 (6개월)\n3단계: 자사몰 구축 + 리뷰 마케팅 (12개월)',
  };
}
