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
        '경쟁사 이름에 "A사", "B사", "00사" 같은 가상 이름 절대 금지. 확실한 실제 브랜드가 있으면 그 이름, 모르면 "네이버 스마트스토어 상위 셀러"처럼 플랫폼+순위로 표현.',
        'JSON 형식으로 출력하라. 마크다운 텍스트 금지.',
        '각 섹션은 구체적이고 실행 가능한 인사이트를 담아야 한다.',
        '모든 섹션은 요약 3줄 + 상세 15줄 이하. 장황한 반복 금지, 핵심 팩트 위주.',
        existingData ? `학생이 학교에서 이미 분석한 데이터: 경쟁사=${existingData.competitors || '없음'}, 고객고충=${existingData.painPoints || '없음'}, 연관키워드=${existingData.keywords || '없음'}. 이 데이터를 기반으로 심화 분석하라.` : '',
      ].filter(Boolean).join(' '),
    }) : '';

    const userPrompt = `키워드: ${input.keyword}\n타겟: ${input.targetAge || '전체'} ${input.targetGender || '전체'}\n상품유형: ${input.itemType || '일반'}\n\nJSON 출력: { "marketSize": "이 시장의 한국 내 추정 규모를 수치로 제시 (예: '연간 약 500억 원, 전년 대비 15% 성장'). 모르면 간접 지표(월 검색량 등) 활용. 요약 3줄 + 상세 15줄 이하. 장황한 반복 금지, 핵심 팩트 위주.", "competitors": [{"name":"실제 브랜드명 (가상 이름 절대 금지. 확실한 브랜드가 없으면 '네이버 스마트스토어 상위 셀러'처럼 플랫폼+순위로 표현)","strengths":"핵심 강점만","weaknesses":"핵심 약점만","positioning":"포지셔닝"}], "swot": {"strengths":[],"weaknesses":[],"opportunities":[],"threats":[]}, "opportunities": ["기회1"], "targetPersona": "타겟 상세. 요약 3줄 이하.", "entryStrategy": "진입 전략. 요약 3줄 + 상세 15줄 이하. 장황한 반복 금지." }`;

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
      { name: '네이버 스마트스토어 상위 셀러 (파워등급)', strengths: '높은 브랜드 인지도', weaknesses: '가격이 비쌈', positioning: '프리미엄' },
      { name: '쿠팡 로켓배송 상위 노출 브랜드', strengths: '가격 경쟁력', weaknesses: '품질 이슈', positioning: '가성비' },
      { name: '무신사 스토어 인기 브랜드', strengths: 'SNS 마케팅 강함', weaknesses: '오프라인 부재', positioning: 'MZ 타겟' },
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
