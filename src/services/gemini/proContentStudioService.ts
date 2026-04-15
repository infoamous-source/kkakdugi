import { generateText, isGeminiEnabled } from './geminiClient';
import { safeParseJSON } from './jsonHelper';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';

// ─── 콘텐츠 스튜디오 프로 — HOOK→EMPATHY→SOLUTION→ACTION 바이럴카드 ───

export type CardStage = 'hook' | 'empathy' | 'solution' | 'action' | 'extra';
export type AdTone = 'emotional' | 'fun' | 'informative' | 'trendy';

export interface CardSlide {
  id: string;
  stage: CardStage;
  copyText: string;
  highlightWord: string;
  image?: string; // base64 data URL (사용자 업로드)
  bgColor: string;
  textColor: string;
  fontSize: number; // 16~32
  overlayOpacity: number; // 0~0.8
}

const STAGE_ORDER: CardStage[] = ['hook', 'empathy', 'solution', 'action', 'extra', 'extra'];
const STAGE_LABELS: Record<CardStage, string> = {
  hook: 'HOOK (시선잡기)',
  empathy: 'EMPATHY (공감)',
  solution: 'SOLUTION (해결)',
  action: 'ACTION (행동)',
  extra: 'EXTRA',
};

export { STAGE_LABELS };

const TONE_GUIDE: Record<AdTone, { label: string; hint: string }> = {
  emotional: { label: '감성', hint: '존댓말/따뜻함. "당신을 위해", "힘들었죠?" 같은 감정 연결형 카피.' },
  fun: { label: '재미', hint: '반말/도발. "97%가 모르는", "아직도 이렇게 해?" 같은 충격적·호기심 자극형 카피.' },
  informative: { label: '정보', hint: '존댓말/객관성. 숫자·통계·비교("78%", "3가지 기준") 중심의 신뢰형 카피.' },
  trendy: { label: 'MZ', hint: '반말/힙함. "이거 실화?", "알잘딱깔센" 같은 MZ 감성 카피.' },
};

const DEFAULT_BG_COLORS = ['#1e293b', '#0f172a', '#7c3aed', '#059669', '#dc2626', '#ea580c'];

export async function generateAdCards(input: {
  productName: string;
  target: string;
  tone: AdTone;
  cardCount: number; // 2~6
  existingData?: { usp?: string; copyTexts?: string[] };
}, profile?: UserProfileView | null): Promise<{ cards: CardSlide[]; isMock: boolean }> {
  const { productName, target, tone, cardCount } = input;
  const count = Math.max(2, Math.min(6, cardCount));

  if (isGeminiEnabled()) {
    try {
      const systemPrompt = profile ? buildSystemPrompt(profile, {
        toolName: '콘텐츠 스튜디오 프로',
        toolPurpose: 'SNS 광고 카드 카피를 HOOK-EMPATHY-SOLUTION-ACTION 공식으로 생성한다.',
        bilingualFeedback: false,
        extraInstructions: [
          '인스타그램 카드뉴스 100만 팔로워 바이럴 전문가예요.',
          '교과서적 표현 금지, 진짜 인스타 카피체로.',
          `톤: ${TONE_GUIDE[tone].label} — ${TONE_GUIDE[tone].hint}`,
          `copyText: ${tone === 'fun' || tone === 'trendy' ? '반말' : '존댓말'}. 각 카드 2-3줄, 한 줄 10자 이내.`,
          input.existingData?.copyTexts?.length
            ? `학교에서 만든 카피들: ${input.existingData.copyTexts.join(' | ')}. 이를 참고하되 더 세련되게.`
            : '',
        ].filter(Boolean).join(' '),
      }) : '';

      const stageInstructions = count <= 4
        ? '4장 공식: 1.HOOK 2.EMPATHY 3.SOLUTION 4.ACTION'
        : `${count}장 공식: 1.HOOK 2.EMPATHY 3.SOLUTION 4.ACTION ${Array.from({ length: count - 4 }, (_, i) => `${5 + i}.EXTRA(보충)`).join(' ')}`;

      const userPrompt = `# 브리프
- 상품/브랜드: ${productName}
- 타겟 고객: ${target || '일반 소비자'}
- 톤: ${TONE_GUIDE[tone].label} — ${TONE_GUIDE[tone].hint}
${input.existingData?.usp ? `- USP: ${input.existingData.usp}` : ''}

# ${stageInstructions}

# 응답 형식 (JSON만)
{
  "cards": [
    {
      "stage": "hook|empathy|solution|action|extra",
      "copyText": "2-3줄. 한 줄 10자 이내. 강렬하게. (줄바꿈 \\n 사용)",
      "highlightWord": "copyText 중 강조할 단어 1개",
      "bgColor": "hex 색상코드 (어두운 배경)"
    }
  ]
}

# 규칙
- 카드 ${count}장 정확히 생성
- ${count >= 3 ? `카드 3~${count}번은 반드시 "${productName}" 브랜드명 포함` : `마지막 카드에 "${productName}" 브랜드명 포함`}
- ${count}장이 하나의 스토리처럼 이어지게
- bgColor는 카드마다 다르게 (어두운 톤 권장)`;

      const prompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${userPrompt}` : userPrompt;
      const text = await generateText(prompt);
      if (text) {
        const parsed = safeParseJSON(text);
        if (parsed?.cards && Array.isArray(parsed.cards) && parsed.cards.length >= 2) {
          const cards: CardSlide[] = parsed.cards.slice(0, count).map(
            (c: { stage?: string; copyText?: string; highlightWord?: string; bgColor?: string }, i: number) => ({
              id: `card_${Date.now()}_${i}`,
              stage: c.stage || STAGE_ORDER[i] || 'extra',
              copyText: c.copyText || '',
              highlightWord: c.highlightWord || '',
              bgColor: c.bgColor || DEFAULT_BG_COLORS[i % DEFAULT_BG_COLORS.length],
              textColor: '#ffffff',
              fontSize: 22,
              overlayOpacity: 0.4,
            }),
          );
          return { cards, isMock: false };
        }
      }
    } catch (err) {
      console.error('[ContentStudioPro] AI generation FAILED:', err);
    }
  }

  return { cards: getMockCards(productName, target, tone, count), isMock: true };
}

export async function regenerateCardCopy(
  cardIndex: number,
  currentCards: CardSlide[],
  input: { productName: string; target: string; tone: AdTone },
  profile?: UserProfileView | null,
): Promise<{ copyText: string; highlightWord: string } | null> {
  if (!isGeminiEnabled()) return null;

  const card = currentCards[cardIndex];
  if (!card) return null;

  try {
    const systemPrompt = profile ? buildSystemPrompt(profile, {
      toolName: '콘텐츠 스튜디오 프로',
      toolPurpose: '단일 카드의 카피를 재생성한다.',
      bilingualFeedback: false,
      extraInstructions: `톤: ${TONE_GUIDE[input.tone].label}. 한 줄 10자 이내. 2-3줄.`,
    }) : '';

    const context = currentCards.map((c, i) => `카드${i + 1}(${c.stage}): ${c.copyText}`).join('\n');

    const userPrompt = `# 카드 ${cardIndex + 1}번 (${STAGE_LABELS[card.stage]}) 카피만 재생성
상품: ${input.productName}, 타겟: ${input.target}

현재 전체 카드:
${context}

카드 ${cardIndex + 1}만 새로운 카피로 바꿔주세요. 다른 카드와 자연스럽게 이어지게.

JSON: {"copyText":"...", "highlightWord":"..."}`;

    const prompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${userPrompt}` : userPrompt;
    const text = await generateText(prompt);
    if (text) {
      const parsed = safeParseJSON(text);
      if (parsed?.copyText) {
        return { copyText: parsed.copyText, highlightWord: parsed.highlightWord || '' };
      }
    }
  } catch (err) {
    console.error('[ContentStudioPro] Regen FAILED:', err);
  }
  return null;
}

// ─── Mock fallback ───

function getMockCards(productName: string, _target: string, tone: AdTone, count: number): CardSlide[] {
  const mockSets: Record<AdTone, { copyText: string; highlightWord: string }[]> = {
    emotional: [
      { copyText: '매일 아침\n당신을 위해', highlightWord: '당신' },
      { copyText: '바쁜 하루가\n힘드셨죠?', highlightWord: '힘드셨죠' },
      { copyText: `${productName}이\n답이에요`, highlightWord: productName },
      { copyText: '오늘부터\n시작해보세요', highlightWord: '오늘' },
      { copyText: '작은 변화가\n큰 행복으로', highlightWord: '행복' },
      { copyText: '지금 이 순간\n놓치지 마세요', highlightWord: '지금' },
    ],
    fun: [
      { copyText: '97%가 모르는\n비밀 하나', highlightWord: '97%' },
      { copyText: '아직도\n이렇게 해?', highlightWord: '아직도' },
      { copyText: `${productName}\n이거 실화?`, highlightWord: '실화' },
      { copyText: '안 사면\n손해인 거 알지?', highlightWord: '손해' },
      { copyText: '친구가\n물어볼 거야', highlightWord: '친구' },
      { copyText: '지금 안 누르면\n후회할 걸?', highlightWord: '후회' },
    ],
    informative: [
      { copyText: `${productName}\n꼭 알아야 할\n3가지`, highlightWord: '3가지' },
      { copyText: '소비자 78%가\n같은 고민', highlightWord: '78%' },
      { copyText: '만족도 95%\n재구매율 Top3', highlightWord: '95%' },
      { copyText: `${productName}\n지금 확인하세요`, highlightWord: productName },
      { copyText: '전문가가\n인정한 품질', highlightWord: '전문가' },
      { copyText: '데이터로\n증명합니다', highlightWord: '데이터' },
    ],
    trendy: [
      { copyText: '이거\n알잘딱깔센', highlightWord: '알잘딱깔센' },
      { copyText: '요즘 다들\n이거 쓴다며', highlightWord: '요즘' },
      { copyText: `${productName}\n갓생러 필수템`, highlightWord: '갓생러' },
      { copyText: '링크는\n프로필에', highlightWord: '링크' },
      { copyText: '찐이야\n찐', highlightWord: '찐' },
      { copyText: '이건 진짜\n넘사벽', highlightWord: '넘사벽' },
    ],
  };

  const picks = mockSets[tone];
  return picks.slice(0, count).map((p, i) => ({
    id: `card_${Date.now()}_${i}`,
    stage: STAGE_ORDER[i] || 'extra',
    copyText: p.copyText,
    highlightWord: p.highlightWord,
    bgColor: DEFAULT_BG_COLORS[i % DEFAULT_BG_COLORS.length],
    textColor: '#ffffff',
    fontSize: 22,
    overlayOpacity: 0.4,
  }));
}
