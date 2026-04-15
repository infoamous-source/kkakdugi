import { generateText, isGeminiEnabled } from './geminiClient';
import { safeParseJSON } from './jsonHelper';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';

export type SectionType = 'hero' | 'features' | 'testimonial' | 'pricing' | 'cta' | 'faq' | 'team' | 'guarantee';

export interface LandingSection {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  bgColor: string;
  image?: string;
  ctaText?: string;
  ctaColor?: string;
}

export async function generateLandingSections(input: {
  brandName: string;
  target: string;
  productDesc: string;
  existingData?: {
    headline?: string;
    painPoints?: string[];
    features?: string[];
    reviews?: string[];
    price?: string;
    ctaText?: string;
  };
}, profile?: UserProfileView | null): Promise<{ sections: LandingSection[]; isMock: boolean }> {
  if (isGeminiEnabled()) {
    const ed = input.existingData;
    const systemPrompt = profile ? buildSystemPrompt(profile, {
      toolName: '랜딩페이지 프로',
      toolPurpose: '브랜드 랜딩페이지의 섹션 5~8개를 생성한다.',
      bilingualFeedback: false,
      extraInstructions: [
        '당신은 한국 이커머스 랜딩페이지 전문 기획자예요.',
        'JSON 배열로 출력. 각 섹션: {id, type, title, content, bgColor}.',
        '순서: hero -> features -> testimonial -> pricing -> cta.',
        ed?.headline ? `학교 기획안 헤드라인: "${ed.headline}". 이를 hero 섹션에 활용.` : '',
        ed?.painPoints?.length ? `학교에서 발견한 고객 고충: ${ed.painPoints.join(', ')}. features 섹션에 반영.` : '',
        ed?.features?.length ? `학교에서 정리한 제품 특징: ${ed.features.join(', ')}. features 섹션에 반영.` : '',
      ].filter(Boolean).join(' '),
    }) : '';

    const userPrompt = `브랜드: ${input.brandName}\n타겟: ${input.target}\n제품: ${input.productDesc}\n\nJSON 배열: [{id:"sec_1",type:"hero",title:"",content:"",bgColor:"#ffffff"}]`;

    try {
      const text = await generateText(systemPrompt ? `${systemPrompt}\n\n---\n\n${userPrompt}` : userPrompt);
      if (text) {
        const parsed = safeParseJSON(text);
        if (Array.isArray(parsed) && parsed.length > 0) return { sections: parsed as LandingSection[], isMock: false };
      }
    } catch (e) {
      console.error('[proLanding] AI failed:', e);
    }
  }

  return { sections: getMockSections(input.brandName), isMock: true };
}

function getMockSections(brandName: string): LandingSection[] {
  return [
    { id: 'sec_1', type: 'hero', title: `${brandName}에 오신 것을 환영합니다`, content: '당신의 일상을 더 특별하게 만들어드릴게요', bgColor: '#6366F1', ctaText: '지금 시작하기', ctaColor: '#F59E0B' },
    { id: 'sec_2', type: 'features', title: '왜 우리를 선택해야 할까요?', content: '빠른 배송\n100% 만족 보장\n전문가 상담 무료', bgColor: '#ffffff' },
    { id: 'sec_3', type: 'testimonial', title: '고객 후기', content: '"정말 만족스러워요! 다음에도 꼭 이용할게요" - 김OO님\n"친구에게도 추천했어요" - 이OO님', bgColor: '#F8FAFC' },
    { id: 'sec_4', type: 'pricing', title: '합리적인 가격', content: '기본 플랜: 19,900원/월\n프로 플랜: 39,900원/월\n엔터프라이즈: 문의', bgColor: '#ffffff' },
    { id: 'sec_5', type: 'cta', title: '지금 바로 시작해보세요', content: '첫 달 무료 체험, 언제든 취소 가능', bgColor: '#6366F1', ctaText: '무료로 시작하기', ctaColor: '#F59E0B' },
  ];
}
