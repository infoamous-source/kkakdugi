import { generateText, isGeminiEnabled } from './geminiClient';
import { safeParseJSON } from './jsonHelper';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';

export interface BrandKitData {
  usp: string;
  slogans: string[];
  colors: Array<{ hex: string; name: string; usage: string }>;
  fonts: { heading: string; body: string };
  voiceGuide: string;
}

export async function generateBrandKit(input: {
  brandName: string;
  industry: string;
  target: string;
  mood: string;
  existingData?: { usp?: string; slogan?: string; primaryColor?: string; secondaryColor?: string; tone?: string };
}, profile?: UserProfileView | null): Promise<{ kit: BrandKitData | null; isMock: boolean }> {
  if (isGeminiEnabled()) {
    const ed = input.existingData;
    const systemPrompt = profile ? buildSystemPrompt(profile, {
      toolName: '브랜드 키트 프로',
      toolPurpose: '브랜드 아이덴티티 키트(USP/슬로건/컬러/폰트/보이스)를 생성한다.',
      bilingualFeedback: false,
      extraInstructions: [
        '당신은 50개 이상의 한국 브랜드를 론칭한 브랜딩 전문가예요.',
        'JSON으로 출력. slogans는 3개, colors는 5개(primary/secondary/accent/background/text).',
        'fonts는 한국어 웹폰트(Pretendard, Noto Sans KR, Spoqa Han Sans 등)에서 선택.',
        '각 섹션은 요약 3줄 + 상세 15줄 이하. 장황한 반복 금지, 핵심 팩트 위주.',
        ed?.usp ? `학교에서 만든 USP: "${ed.usp}". 이를 기반으로 발전시켜라.` : '',
        ed?.slogan ? `학교에서 만든 슬로건: "${ed.slogan}". 3개로 확장하라.` : '',
        ed?.primaryColor ? `학교에서 선택한 메인 컬러: ${ed.primaryColor}. 이를 primary로 유지하고 나머지 4색을 조화롭게.` : '',
      ].filter(Boolean).join(' '),
    }) : '';

    const userPrompt = `브랜드: ${input.brandName}\n산업: ${input.industry}\n타겟: ${input.target}\n무드: ${input.mood}\n\nJSON: { "usp": "", "slogans": ["","",""], "colors": [{"hex":"","name":"","usage":""}], "fonts": {"heading":"","body":""}, "voiceGuide": "" }`;

    try {
      const text = await generateText(systemPrompt ? `${systemPrompt}\n\n---\n\n${userPrompt}` : userPrompt);
      if (text) {
        const parsed = safeParseJSON(text) as BrandKitData;
        if (parsed?.usp && parsed?.slogans) return { kit: parsed, isMock: false };
      }
    } catch (e) {
      console.error('[proBrandKit] AI failed:', e);
    }
  }

  return { kit: getMockKit(input.brandName), isMock: true };
}

export async function regenerateSlogans(
  currentKit: BrandKitData,
  brandName: string,
  profile?: UserProfileView | null,
): Promise<string[] | null> {
  if (!isGeminiEnabled()) return null;

  const prompt = profile ? buildSystemPrompt(profile, {
    toolName: '브랜드 키트 프로 (슬로건 재생성)',
    toolPurpose: '브랜드 슬로건 3개를 새로 만든다.',
    bilingualFeedback: false,
  }) : '';
  const userPrompt = `브랜드: ${brandName}\nUSP: ${currentKit.usp}\n현재 슬로건: ${currentKit.slogans.join(', ')}\n\n완전히 새로운 슬로건 3개를 JSON 배열로: ["","",""]`;
  try {
    const text = await generateText(prompt ? `${prompt}\n\n---\n\n${userPrompt}` : userPrompt);
    if (text) {
      const arr = safeParseJSON(text);
      if (Array.isArray(arr)) return arr as string[];
    }
  } catch { /* fallback */ }
  return null;
}

function getMockKit(brandName: string): BrandKitData {
  return {
    usp: `${brandName}만의 특별한 가치 -- 고객의 일상을 더 편하게`,
    slogans: [`${brandName}, 당신의 일상에 플러스`, `더 쉽게, 더 가깝게 -- ${brandName}`, `${brandName}과 함께하는 스마트 라이프`],
    colors: [
      { hex: '#6366F1', name: '프라이머리', usage: '로고, 주요 버튼' },
      { hex: '#8B5CF6', name: '세컨더리', usage: '강조, 배지' },
      { hex: '#F59E0B', name: '액센트', usage: 'CTA, 할인 표시' },
      { hex: '#F8FAFC', name: '배경', usage: '페이지 배경' },
      { hex: '#1E293B', name: '텍스트', usage: '본문, 제목' },
    ],
    fonts: { heading: 'Pretendard', body: 'Noto Sans KR' },
    voiceGuide: `${brandName}의 말투는 친근하면서도 전문적이에요. 존댓말을 기본으로 하되, SNS에서는 가벼운 ~해요 체를 사용합니다. 전문 용어는 쉬운 말로 풀어서.`,
  };
}
