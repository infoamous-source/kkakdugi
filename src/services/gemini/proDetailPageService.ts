import { generateText, isGeminiEnabled } from './geminiClient';
import { safeParseJSON } from './jsonHelper';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';
import type {
  DetailPagePlan,
  AttentionType,
} from '../../types/school';

// ─── 상세페이지 프로 — 쿠팡/스마트스토어 스타일 상세페이지 ───

// 학교 DetailPagePlan을 그대로 재사용
export type { DetailPagePlan };

export interface ProDetailPageResult {
  detailPage: DetailPagePlan;
  images: { afterSection: number; dataUrl?: string }[]; // 사용자가 삽입한 이미지 위치
}

export async function generateDetailPage(input: {
  productName: string;
  customers: string;
  strengths: string;
  offers: string;
  existingData?: Partial<DetailPagePlan>;
}, profile?: UserProfileView | null): Promise<{ detailPage: DetailPagePlan; isMock: boolean }> {
  if (isGeminiEnabled()) {
    try {
      const systemPrompt = profile ? buildSystemPrompt(profile, {
        toolName: '상세페이지 프로',
        toolPurpose: '쿠팡/네이버 스마트스토어 스타일 상세페이지 기획안을 생성한다.',
        bilingualFeedback: false,
        extraInstructions: [
          '한국 쿠팡/네이버 스마트스토어 상세페이지 전문 기획자예요.',
          '스크롤을 멈추게 하는 구어체 헤드라인, 실감나는 후기, FOMO(놓침 두려움) 유도.',
          input.existingData?.headline ? `학교 기획안 헤드라인: "${input.existingData.headline}". 참고하되 더 강렬하게.` : '',
          input.existingData?.painPoints?.length ? `학교 painPoints: ${input.existingData.painPoints.map(p => p.text).join(', ')}. 참고.` : '',
        ].filter(Boolean).join(' '),
      }) : '';

      const userPrompt = `# 상품 정보
- 상품/브랜드: ${input.productName}
- 주요 고객: ${input.customers || '일반 소비자'}
- 다른 곳에 없는 장점: ${input.strengths || '좋은 품질'}
- 오늘의 특별 혜택: ${input.offers || '특별 할인'}

# 어그로 한 줄 규칙
attentionLine.type은 "B" 또는 "C" 중 랜덤 선택.
- B형 (어그로형): 호기심 자극 한 줄
- C형 (사회적 증거형): 숫자/증거 한 줄

# 응답 형식 (JSON만)
{
  "productTitle": "[오늘만 30% 특가] 상품명 / 장점1 / 장점2",
  "brandLine": "브랜드명 공식",
  "originalPrice": 정가(숫자),
  "salePrice": 할인가(숫자),
  "discountPercent": 할인율(숫자),
  "rating": 4.8,
  "reviewCount": 2000~5000,
  "countdownLabel": "오늘 자정 종료까지",
  "countdownValue": "06:23:41",
  "attentionLine": { "type": "B or C", "text": "한 줄 카피" },
  "headlinePrefix": "잠깐, 혹시",
  "headline": "구어체 헤드라인 (\\n 허용, 최대 3줄)",
  "headlineHighlight": "강조 단어",
  "painPointsTitle": "혹시 이런 분\\n아니세요?",
  "painPoints": [
    { "emoji": "이모지", "text": "~한 사람! 형태" },
    { "emoji": "이모지", "text": "~한 사람!" },
    { "emoji": "이모지", "text": "~한 사람!" }
  ],
  "solutionPrefix": "그래서 만들었어요",
  "solutionHeadline": "해결 헤드라인",
  "featuresTitle": "브랜드명의\\n3가지 약속",
  "features": [
    { "emoji": "이모지", "title": "짧은 제목", "description": "짧은 설명", "colorKey": "amber" },
    { "emoji": "이모지", "title": "짧은 제목", "description": "짧은 설명", "colorKey": "green" },
    { "emoji": "이모지", "title": "짧은 제목", "description": "짧은 설명", "colorKey": "blue" }
  ],
  "reviews": [
    { "stars": "별별별별별", "text": "생생한 후기", "author": "김** 30대" },
    { "stars": "별별별별별", "text": "생생한 후기", "author": "박** 20대" }
  ],
  "finalCtaDeadline": "오늘 자정 종료",
  "finalCtaHeadline": "놓치면\\n정가 그대로",
  "stickyCtaText": "할인가 구매하기"
}

# 작성 규칙
- painPoints는 반드시 "~한 사람!" 형태
- headline은 구어체, 캐주얼
- reviews는 실감나는 구체적 상황 포함
- features의 colorKey는 amber/green/blue 순서
- 입력된 고객/장점/혜택을 반드시 모두 반영
- 절대 관련 없는 상품으로 추측하지 말 것`;

      const prompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${userPrompt}` : userPrompt;
      const text = await generateText(prompt);
      if (text) {
        let parsed = safeParseJSON(text);
        // detailPage 래핑 처리
        if (parsed?.detailPage) parsed = parsed.detailPage;
        if (parsed?.productTitle && parsed?.painPoints) {
          // attentionLine 보정
          if (!parsed.attentionLine || (parsed.attentionLine.type !== 'B' && parsed.attentionLine.type !== 'C')) {
            parsed.attentionLine = {
              type: (Math.random() > 0.5 ? 'B' : 'C') as AttentionType,
              text: parsed.attentionLine?.text || '스크롤 내리기 전에\n이것만 보고 가세요',
            };
          }
          return { detailPage: parsed as DetailPagePlan, isMock: false };
        }
      }
    } catch (err) {
      console.error('[DetailPagePro] AI generation FAILED:', err);
    }
  }

  return { detailPage: getMockDetailPage(input), isMock: true };
}

export async function regenerateSection(
  sectionKey: string,
  currentData: DetailPagePlan,
  input: { productName: string; customers: string; strengths: string },
  profile?: UserProfileView | null,
): Promise<string | null> {
  if (!isGeminiEnabled()) return null;

  try {
    const systemPrompt = profile ? buildSystemPrompt(profile, {
      toolName: '상세페이지 프로',
      toolPurpose: '상세페이지의 특정 섹션만 재생성한다.',
      bilingualFeedback: false,
    }) : '';

    const userPrompt = `상품: ${input.productName}, 고객: ${input.customers}, 장점: ${input.strengths}

현재 상세페이지의 "${sectionKey}" 섹션만 새로 작성해주세요.
현재 값: ${JSON.stringify((currentData as unknown as Record<string, unknown>)[sectionKey])}

같은 형식의 JSON 값만 반환:`;

    const prompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${userPrompt}` : userPrompt;
    const text = await generateText(prompt);
    return text || null;
  } catch (err) {
    console.error('[DetailPagePro] Regen FAILED:', err);
    return null;
  }
}

// ─── Mock fallback ───

function getMockDetailPage(input: {
  productName: string;
  customers: string;
  strengths: string;
  offers: string;
}): DetailPagePlan {
  const { productName, customers, strengths, offers } = input;
  const customer = customers || '고객';
  const strength = strengths || '좋은 품질';
  const offer = offers || '30% 할인';
  const discountMatch = offer.match(/(\d+)\s*%/);
  const discountPercent = discountMatch ? Number(discountMatch[1]) : 30;
  const originalPrice = 39900;
  const salePrice = Math.round((originalPrice * (100 - discountPercent)) / 100);

  const attentionPool: { type: AttentionType; text: string }[] = [
    { type: 'B', text: 'スクロール 내리기 전에\n이것만 보고 가세요' },
    { type: 'C', text: '이미 2,341명이 선택한 이유' },
  ];

  return {
    productTitle: `[오늘만 ${discountPercent}% 특가] ${productName}`,
    brandLine: `${productName} 공식`,
    originalPrice,
    salePrice,
    discountPercent,
    rating: 4.8,
    reviewCount: 2341,
    countdownLabel: '오늘 자정 종료까지',
    countdownValue: '06:23:41',
    attentionLine: attentionPool[Math.floor(Math.random() * attentionPool.length)],
    headlinePrefix: '잠깐, 혹시',
    headline: `${productName}\n지금 시작하세요!`,
    headlineHighlight: productName,
    painPointsTitle: '혹시 이런 분\n아니세요?',
    painPoints: [
      { emoji: '😫', text: `${customer}인데\n좋은 것을 못 찾는 사람!` },
      { emoji: '🤔', text: `${strength}\n해보고 싶은 사람!` },
      { emoji: '💸', text: '돈은 아끼면서\n좋은 건 누리고 싶은 사람!' },
    ],
    solutionPrefix: '그래서 만들었어요',
    solutionHeadline: `${productName}으로\n바로 해결!`,
    featuresTitle: `${productName}만의\n3가지 약속`,
    features: [
      { emoji: '⏰', title: '빠른 효과', description: `${strength}\n바로 체감`, colorKey: 'amber' },
      { emoji: '💰', title: '합리적 가격', description: `${offer}\n부담 없이`, colorKey: 'green' },
      { emoji: '🌱', title: '검증된 품질', description: '만족도 95%\n재구매율 1위', colorKey: 'blue' },
    ],
    reviews: [
      { stars: '★★★★★', text: '"정말 만족스러워요! 주변에 추천하고 있어요."', author: '김** · 30대' },
      { stars: '★★★★★', text: '"이 가격에 이 퀄리티? 재구매 확정이에요!"', author: '박** · 20대' },
    ],
    finalCtaDeadline: '오늘 자정 종료',
    finalCtaHeadline: `놓치면\n${originalPrice.toLocaleString()}원 그대로`,
    stickyCtaText: `${salePrice.toLocaleString()}원 · 구매하기`,
  };
}
