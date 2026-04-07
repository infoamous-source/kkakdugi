import { generateText, isGeminiEnabled } from './geminiClient';
import type {
  ViralCardResult,
  ViralCardSlide,
  ViralTone,
  ViralCardTemplate,
} from '../../types/school';
import { safeParseJSON } from './jsonHelper';

// ─── 4교시 바이럴카드 — 4장 카드뉴스 카피 + Pexels 키워드 생성 ───

const TONE_GUIDE: Record<ViralTone, { label: string; hint: string }> = {
  spicy: {
    label: '🌶️ 자극형',
    hint: '반말/도발. "97%가 모르는", "아직도 이렇게 해?" 같은 충격적·호기심 자극형 카피.',
  },
  emotional: {
    label: '💗 감성형',
    hint: '존댓말/따뜻함. "당신을 위해", "힘들었죠?" 같은 감정 연결형 카피.',
  },
  informative: {
    label: '📊 정보형',
    hint: '존댓말/객관성. 숫자·통계·비교("78%", "3가지 기준") 중심의 신뢰형 카피.',
  },
};

// 카드별 기본 템플릿 — mockup 확정안
// 1번: Template A (상단 흰 박스 + 하단 이미지)
// 2번: Template B (풀이미지 + 하단 검은 그라데이션)
// 3번: Template C (풀이미지 + 가운데 큰 글씨, 브랜드 노출)
// 4번: Template D (좌측 컬러박스 + 우측 이미지, 브랜드 노출)
const DEFAULT_TEMPLATES: Record<number, ViralCardTemplate> = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
};

const STEP_LABELS: Record<number, { step: ViralCardSlide['step']; en: string; ko: string }> = {
  0: { step: 'hook', en: 'HOOK', ko: '시선잡기' },
  1: { step: 'empathy', en: 'EMPATHY', ko: '공감' },
  2: { step: 'solution', en: 'SOLUTION', ko: '해결' },
  3: { step: 'action', en: 'ACTION', ko: '행동' },
};

export async function generateViralCards(
  productName: string,
  targetPersonas: string[],
  usp: string,
  tone: ViralTone,
): Promise<{ result: ViralCardResult['output']; isMock: boolean }> {
  if (isGeminiEnabled()) {
    try {
      const persona = targetPersonas.filter(Boolean).join(', ') || '일반 소비자';
      const prompt = `# 역할
인스타그램 카드뉴스 100만 팔로워 바이럴 전문가예요.

# 브리프
- 상품/브랜드: ${productName}
- 타겟 고객: ${persona}
- 차별점(USP): ${usp}
- 톤: ${TONE_GUIDE[tone].label} — ${TONE_GUIDE[tone].hint}

# 4장 공식
1. HOOK (시선잡기) — 0.3초 안에 스크롤 멈추게, 충격 숫자·반전·질문
2. EMPATHY (공감) — "이거 완전 내 얘기" 구체적 상황
3. SOLUTION (해결) — USP를 1문장으로, 브랜드 노출
4. ACTION (행동) — 지금 당장 구매 유도, 브랜드 노출

# 응답 형식 (JSON만)
{
  "slides": [
    {
      "copyText": "2-3줄. 한 줄 10자 이내. 강렬하게. (줄바꿈 \\n 사용)",
      "highlightWord": "copyText 중 노란색으로 강조할 단어 1개 (선택)",
      "imageKeyword": "Pexels 검색용 짧은 영어 키워드 3-5단어 (예: 'morning coffee cafe')"
    },
    { "copyText": "...", "highlightWord": "...", "imageKeyword": "..." },
    { "copyText": "...", "highlightWord": "...", "imageKeyword": "..." },
    { "copyText": "...", "highlightWord": "...", "imageKeyword": "..." }
  ]
}

# 작성 규칙
- copyText: TOPIK 3급 쉬운 한국어 ${tone === 'spicy' ? '반말' : '존댓말'}. 각 카드 2-3줄, 한 줄 10자 이내
- 카드 3·4는 반드시 "${productName}" 브랜드명을 포함
- imageKeyword는 영어, 소문자, 구체적 (예: "coffee steam morning"), 텍스트가 없는 이미지 찾기 좋은 키워드
- 4장이 하나의 스토리처럼 이어지게
- 교과서적 표현 금지, 진짜 인스타 카피체로`;

      const text = await generateText(prompt);
      if (text) {
        const parsed = safeParseJSON(text);
        if (parsed?.slides && Array.isArray(parsed.slides) && parsed.slides.length === 4) {
          const slides: ViralCardSlide[] = parsed.slides.map(
            (s: { copyText?: string; highlightWord?: string; imageKeyword?: string }, i: number) => ({
              step: STEP_LABELS[i].step,
              stepLabel: STEP_LABELS[i].en,
              stepKoLabel: STEP_LABELS[i].ko,
              copyText: s.copyText || '',
              highlightWord: s.highlightWord,
              imageKeyword: s.imageKeyword || 'lifestyle',
              template: DEFAULT_TEMPLATES[i],
              showBrand: i >= 2,
            }),
          );
          return { result: { slides }, isMock: false };
        }
      }
    } catch (err) {
      console.error('[ViralCard] AI generation FAILED, falling back to mock:', err);
    }
  }
  return { result: getMockViralCards(productName, usp, tone), isMock: true };
}

// ─── Mock fallback ───

function getMockViralCards(
  productName: string,
  usp: string,
  tone: ViralTone,
): ViralCardResult['output'] {
  const usp1 = usp || '카페 수준';

  const base = {
    spicy: [
      { copyText: '97%가 모르는\n아침의 비밀 ☕', highlightWord: '97%', imageKeyword: 'morning coffee cafe' },
      { copyText: '한 잔이\n유일한 위로일 때', highlightWord: '위로', imageKeyword: 'tired person coffee' },
      { copyText: `3분 만에\n${usp1}\n절반 가격`, highlightWord: usp1, imageKeyword: 'espresso cup premium' },
      { copyText: `${productName}\n지금\n주문하기`, highlightWord: '지금', imageKeyword: 'coffee pouring' },
    ],
    emotional: [
      { copyText: '매일 아침\n당신을 위해', highlightWord: '당신', imageKeyword: 'warm morning home' },
      { copyText: '바쁜 하루가\n힘드셨죠?', highlightWord: '힘드셨죠', imageKeyword: 'cozy kitchen coffee' },
      { copyText: `${productName}이\n답이에요`, highlightWord: productName, imageKeyword: 'steaming coffee warm' },
      { copyText: `오늘부터\n시작해보세요`, highlightWord: '오늘', imageKeyword: 'happy morning coffee' },
    ],
    informative: [
      { copyText: `${productName}\n꼭 알아야 할\n3가지`, highlightWord: '3가지', imageKeyword: 'infographic data' },
      { copyText: '소비자 78%가\n같은 고민', highlightWord: '78%', imageKeyword: 'survey chart data' },
      { copyText: `만족도 95%\n재구매율 Top 3`, highlightWord: '95%', imageKeyword: 'quality certification badge' },
      { copyText: `${productName}\n프로필 링크\n확인하세요`, highlightWord: productName, imageKeyword: 'professional product shot' },
    ],
  } as const;

  const picks = base[tone];
  const slides: ViralCardSlide[] = picks.map((p, i) => ({
    step: STEP_LABELS[i].step,
    stepLabel: STEP_LABELS[i].en,
    stepKoLabel: STEP_LABELS[i].ko,
    copyText: p.copyText,
    highlightWord: p.highlightWord,
    imageKeyword: p.imageKeyword,
    template: DEFAULT_TEMPLATES[i],
    showBrand: i >= 2,
  }));

  return { slides };
}
