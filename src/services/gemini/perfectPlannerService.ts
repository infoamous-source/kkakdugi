import { generateText, isGeminiEnabled } from './geminiClient';
import type {
  PerfectPlannerInput,
  PerfectPlannerResult,
  DetailPagePlan,
  LiveScript,
  AttentionType,
} from '../../types/school';
import { safeParseJSON } from './jsonHelper';

// ─── 5교시 퍼펙트플래너 — 상세페이지 + 라이브 방송 대본 ───

export async function generateSalesPlan(
  input: PerfectPlannerInput,
): Promise<{ result: PerfectPlannerResult['output']; isMock: boolean }> {
  if (isGeminiEnabled()) {
    try {
      const prompt = buildPrompt(input);
      const text = await generateText(prompt);
      if (text) {
        const parsed = safeParseJSON(text);
        if (parsed?.detailPage && parsed?.liveScript) {
          // attentionLine type 보정
          if (
            !parsed.detailPage.attentionLine ||
            (parsed.detailPage.attentionLine.type !== 'B' &&
              parsed.detailPage.attentionLine.type !== 'C')
          ) {
            parsed.detailPage.attentionLine = {
              type: (Math.random() > 0.5 ? 'B' : 'C') as AttentionType,
              text:
                parsed.detailPage.attentionLine?.text ||
                '✋ 스크롤 내리기 전에\n이것만 보고 가세요',
            };
          }
          return { result: parsed, isMock: false };
        }
      }
    } catch (err) {
      console.error('[PerfectPlanner] AI generation FAILED, falling back to mock:', err);
    }
  }
  return { result: getMockSalesPlan(input), isMock: true };
}

// ─── 프롬프트 빌더 ───

function buildPrompt(input: PerfectPlannerInput): string {
  const customers = input.customers.filter(Boolean).join(', ') || '일반 소비자';
  const strengths = input.strengths.filter(Boolean).join(', ') || '좋은 품질';
  const offers = input.offers.filter(Boolean).join(', ') || '특별 할인';

  return `# 역할
한국 쿠팡·네이버 스마트스토어·카카오 라이브커머스 전문 기획자예요.
상세페이지는 스크롤을 멈추게 하고, 라이브 대본은 시청자가 "지금 안 사면 손해"라고 느끼게 만들어요.
외국인 학생(TOPIK 3급)도 읽을 수 있는 쉬운 한국어로 작성해요.

# 상품 정보
- 상품/브랜드: ${input.productName}
- 주요 고객: ${customers}
- 다른 곳에 없는 장점: ${strengths}
- 오늘의 특별 혜택: ${offers}

# 어그로 한 줄 규칙 (매번 다르게)
attentionLine.type은 "B" 또는 "C" 중 랜덤으로 선택하세요.
- B형 (어그로형): "✋ 스크롤 내리기 전에\\n이것만 보고 가세요" 같은 호기심 자극 한 줄
- C형 (사회적 증거형): "이미 2,341명이 선택한 이유 ↓" 같은 숫자/증거 한 줄
두 형태가 매번 다르게 섞여서 나오도록 하세요.

# 응답 형식 (JSON만, 다른 텍스트 X)
{
  "detailPage": {
    "productTitle": "[오늘만 30% 특가] 상품명 / 장점1 / 장점2 형태의 긴 상품명",
    "brandLine": "브랜드명 + '공식' 또는 '스토어'",
    "originalPrice": 정가(숫자),
    "salePrice": 할인가(숫자),
    "discountPercent": 할인율(숫자, 예: 30),
    "rating": 4.8,
    "reviewCount": 2000~5000 사이 숫자,
    "countdownLabel": "⏰ 오늘 자정 종료까지",
    "countdownValue": "06:23:41",
    "attentionLine": { "type": "B 또는 C", "text": "한 줄 카피 (줄바꿈 \\n 1개 허용)" },
    "headlinePrefix": "잠깐, 혹시 같은 짧은 prefix",
    "headline": "스크롤을 멈추게 하는 구체적 한 줄 카피 (줄바꿈 \\n 허용, 최대 3줄)",
    "headlineHighlight": "headline 중 강조할 단어 (예: '우리집?!')",
    "painPointsTitle": "😩 혹시 이런 분\\n아니세요?",
    "painPoints": [
      { "emoji": "☕", "text": "~한 사람! 형태의 불만 1 (\\n 1개 허용)" },
      { "emoji": "🤢", "text": "~한 사람! 형태의 불만 2" },
      { "emoji": "💸", "text": "~한 사람! 형태의 불만 3" }
    ],
    "solutionPrefix": "그래서 만들었어요",
    "solutionHeadline": "해결 헤드라인 (\\n 1개 허용, 최대 2줄)",
    "featuresTitle": "✅ 브랜드명의\\n3가지 약속",
    "features": [
      { "emoji": "⏰", "title": "짧은 제목", "description": "짧은 설명 (\\n 1개 허용)", "colorKey": "amber" },
      { "emoji": "💰", "title": "짧은 제목", "description": "짧은 설명", "colorKey": "green" },
      { "emoji": "🌱", "title": "짧은 제목", "description": "짧은 설명", "colorKey": "blue" }
    ],
    "reviews": [
      { "stars": "★★★★★", "text": "생생한 후기 한 줄 (따옴표 포함)", "author": "김** · 30대 직장인" },
      { "stars": "★★★★★", "text": "생생한 후기 한 줄", "author": "박** · 캡슐 매니아" }
    ],
    "finalCtaDeadline": "⏰ 오늘 자정 종료",
    "finalCtaHeadline": "놓치면\\n정가 그대로",
    "stickyCtaText": "할인가 · 구매하기"
  },
  "liveScript": {
    "title": "${input.productName} · 30분 라이브 큐시트",
    "expectedViewers": "예상 시청 500~800",
    "items": [
      {
        "emoji": "🎬",
        "timeRange": "0:00 ~ 2:00",
        "title": "오프닝",
        "duration": "2분",
        "hostScript": "진행자 멘트 (에너지 넘치게)",
        "action": "📌 액션: 카메라에 미소, 상품 한 손에 보여주기",
        "audienceReaction": "💬 시청자: '안녕하세요' 댓글 유도",
        "colorKey": "orange"
      },
      {
        "emoji": "🎬",
        "timeRange": "2:00 ~ 6:00",
        "title": "공감 들어가기",
        "duration": "4분",
        "hostScript": "고객 불만에 공감하는 멘트",
        "action": "📌 액션: 한숨 쉬는 표정, 제스처",
        "audienceReaction": "💬 시청자: '저요' 댓글 폭주 유도",
        "colorKey": "amber"
      },
      {
        "emoji": "🎬",
        "timeRange": "6:00 ~ 14:00",
        "title": "진짜 시연",
        "duration": "8분",
        "hostScript": "지금부터 진짜 보여드릴게요 톤의 실제 시연 멘트",
        "action": "📌 액션: 실제 상품 시연 동작",
        "audienceReaction": "💬 시청자: 감탄 댓글 유도",
        "extra": "☕ 결과: 직접 써보고 리액션",
        "colorKey": "green"
      },
      {
        "emoji": "🎬",
        "timeRange": "14:00 ~ 22:00",
        "title": "Q&A",
        "duration": "8분",
        "hostScript": "예상 질문 1: ~? / 답변: ~.\\n예상 질문 2: ~? / 답변: ~.",
        "colorKey": "blue"
      },
      {
        "emoji": "🎬",
        "timeRange": "22:00 ~ 30:00",
        "title": "마무리·주문 유도",
        "duration": "8분",
        "hostScript": "마지막 결정타 멘트. 오늘 이 가격 오늘만이에요!",
        "action": "📌 액션: 큰 손가락으로 화면 아래 주문 버튼 가리키기",
        "extra": "⏰ 자막: '오늘 자정까지' 빨간색 깜빡임",
        "colorKey": "red"
      }
    ]
  }
}

# 작성 규칙
- 모든 텍스트 TOPIK 3급 쉬운 한국어 ~해요 체
- painPoints는 반드시 "~한 사람!" 형태 (마지막에 느낌표)
- headline은 구어체, 캐주얼 ("3분이면 카페가 우리집?!" 수준)
- reviews는 실감나는 구체적 상황 포함
- features의 colorKey는 amber/green/blue 순서로
- 모든 \\n은 실제 줄바꿈 1개를 의미 (카드 내 2줄 정도까지만)
- ${input.productName}을 결과 곳곳에 자연스럽게 녹이세요
- 가격(originalPrice, salePrice, discountPercent)은 offers 내용("${offers}")에서 추론하거나 합리적으로 설정`;
}

// ─── Mock fallback ───

function getMockSalesPlan(input: PerfectPlannerInput): PerfectPlannerResult['output'] {
  const productName = input.productName || '상품';
  const offer = input.offers.filter(Boolean)[0] || '30% 할인';
  const discountMatch = offer.match(/(\d+)\s*%/);
  const discountPercent = discountMatch ? Number(discountMatch[1]) : 30;
  const originalPrice = 30000;
  const salePrice = Math.round((originalPrice * (100 - discountPercent)) / 100);

  const attentionPool: { type: AttentionType; text: string }[] = [
    { type: 'B', text: '✋ 스크롤 내리기 전에\n이것만 보고 가세요' },
    { type: 'B', text: '🙈 지금 안 보면\n후회할지도 몰라요' },
    { type: 'C', text: '이미 2,341명이 선택한 이유 ↓' },
    { type: 'C', text: '만족도 98%, 재구매율 67% 🔥' },
  ];
  const attentionLine = attentionPool[Math.floor(Math.random() * attentionPool.length)];

  const detailPage: DetailPagePlan = {
    productTitle: `[오늘만 ${discountPercent}% 특가] ${productName} / 카페 수준 / 3분 추출`,
    brandLine: `${productName} 공식`,
    originalPrice,
    salePrice,
    discountPercent,
    rating: 4.8,
    reviewCount: 2341,
    countdownLabel: '⏰ 오늘 자정 종료까지',
    countdownValue: '06:23:41',
    attentionLine,
    headlinePrefix: '잠깐, 혹시',
    headline: '3분이면\n카페가\n우리집?! ☕',
    headlineHighlight: '우리집?!',
    painPointsTitle: '😩 혹시 이런 분\n아니세요?',
    painPoints: [
      { emoji: '☕', text: '출근 전 카페에서\n줄 서는 게 지치는 사람!' },
      { emoji: '🤢', text: '인스턴트 커피는\n맛이 없는 사람!' },
      { emoji: '💸', text: '캡슐 한 알에 천원,\n비싸다고 느끼는 사람!' },
    ],
    solutionPrefix: '그래서 만들었어요',
    solutionHeadline: '캡슐 한 알이면\n카페가 부엌에',
    featuresTitle: `✅ ${productName}만의\n3가지 약속`,
    features: [
      {
        emoji: '⏰',
        title: '단 3분',
        description: '물 붓고 기다리면 끝!\n카페 줄 안 서도 돼요',
        colorKey: 'amber',
      },
      {
        emoji: '💰',
        title: '한 알 500원',
        description: '네스프레소의 절반 가격\n매일 마셔도 부담 X',
        colorKey: 'green',
      },
      {
        emoji: '🌱',
        title: '100% 친환경',
        description: '분해되는 캡슐\n죄책감 0',
        colorKey: 'blue',
      },
    ],
    reviews: [
      {
        stars: '★★★★★',
        text: '"진짜 서울 카페 맛이에요. 출근길이 행복해졌어요."',
        author: '김** · 30대 직장인',
      },
      {
        stars: '★★★★★',
        text: '"네스프레소 쓰다가 갈아탔는데 맛이 더 좋네요?!"',
        author: '박** · 캡슐 매니아',
      },
    ],
    finalCtaDeadline: '⏰ 오늘 자정 종료',
    finalCtaHeadline: `놓치면\n${originalPrice.toLocaleString()}원 그대로`,
    stickyCtaText: `${salePrice.toLocaleString()}원 · 구매하기`,
  };

  const liveScript: LiveScript = {
    title: `${productName} · 30분 라이브 큐시트`,
    expectedViewers: '예상 시청 600+',
    items: [
      {
        emoji: '🎬',
        timeRange: '0:00 ~ 2:00',
        title: '오프닝',
        duration: '2분',
        hostScript: `"안녕하세요! 오늘 깜짝 선물 들고 왔어요. 끝까지 보시면 후회 안 하실 거예요!"`,
        action: `📌 액션: 카메라에 미소, ${productName} 한 알 손에 들고 보여주기`,
        audienceReaction: `💬 시청자: "안녕하세요" 댓글 유도`,
        colorKey: 'orange',
      },
      {
        emoji: '🎬',
        timeRange: '2:00 ~ 6:00',
        title: '공감 들어가기',
        duration: '4분',
        hostScript: `"여러분, 혹시 아침마다 카페 줄 서느라 힘드신 분~? 댓글로 '저요' 한 번 적어주세요!"`,
        action: '📌 액션: 한숨 쉬는 표정, 손목시계 보는 제스처',
        audienceReaction: `💬 시청자: "저요" 댓글 폭주 유도 → 화면에 댓글 띄우기`,
        colorKey: 'amber',
      },
      {
        emoji: '🎬',
        timeRange: '6:00 ~ 14:00',
        title: '진짜 시연 (3분 추출)',
        duration: '8분',
        hostScript: `"지금부터 진짜 3분만에 만들어볼게요. 시간 같이 재봐요!"`,
        action: '📌 액션: 캡슐 넣기 → 물 붓기 → 타이머 시작 (대형 자막)',
        audienceReaction: `💬 시청자: "와" "진짜 빠르네요" 댓글 유도`,
        extra: '☕ 결과: 한 잔 따라서 직접 마시고 표정 리액션',
        colorKey: 'green',
      },
      {
        emoji: '🎬',
        timeRange: '14:00 ~ 22:00',
        title: 'Q&A',
        duration: '8분',
        hostScript: `예상 질문 1: "맛이 진짜 카페 같아요?" / 답변: "네! 원두를 직접 갈아서 담았어요. 지금 따라드릴 테니 같이 보세요."\n예상 질문 2: "한 알에 얼마예요?" / 답변: "원래 1,000원인데 오늘 라이브에서만 500원이에요!"`,
        colorKey: 'blue',
      },
      {
        emoji: '🎬',
        timeRange: '22:00 ~ 30:00',
        title: '마무리·주문 유도',
        duration: '8분',
        hostScript: `"여러분, 이거 진짜 오늘만이에요. ${discountPercent}% 할인은 자정에 끝나요. 지금 바로 주문 버튼 눌러주세요!"`,
        action: '📌 액션: 큰 손가락으로 화면 아래 주문 버튼 가리키기',
        extra: '⏰ 자막: "오늘 자정까지" 빨간색 깜빡임',
        colorKey: 'red',
      },
    ],
  };

  return { detailPage, liveScript };
}
