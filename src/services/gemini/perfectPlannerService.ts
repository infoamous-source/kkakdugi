import { generateText, isGeminiEnabled } from './geminiClient';
import type { PerfectPlannerResult } from '../../types/school';
import { safeParseJSON } from './jsonHelper';

// ─── 판매 계획 생성 ───

export async function generateSalesPlan(
  productName: string,
  coreTarget: string,
  usp: string,
  strongOffer: string,
): Promise<{ result: PerfectPlannerResult['output']; isMock: boolean }> {
  if (isGeminiEnabled()) {
    try {
      const prompt = `# 역할
당신은 쿠팡 로켓그로스, 네이버 스마트스토어, 카카오 선물하기에서 월 매출 1억 이상 셀러들의 상세페이지와 라이브방송을 기획해온 한국 이커머스 전문 기획자예요.
당신의 카피는 스크롤을 멈추게 하고, 당신의 라이브 대본은 시청자가 "지금 안 사면 손해"라고 느끼게 만들어요.

# 상품 정보
- 상품/브랜드: ${productName}
- 핵심 타겟: ${coreTarget}
- 차별점(USP): ${usp}
- 강력한 혜택/제안: ${strongOffer}

# 사고 과정 (Chain of Thinking)
응답을 만들기 전에 아래 순서로 먼저 생각하세요 (이 사고 과정은 JSON에 포함하지 마세요):
1단계) "${coreTarget}"이 평소 어떤 불만을 갖고 있고, 어떤 순간에 검색하는지 상상하세요.
2단계) "${productName}"의 USP("${usp}")가 그 불만을 어떻게 해결하는지 연결하세요.
3단계) 고객의 구매 여정을 설계하세요: 발견 → 관심 → 비교 → 확신 → 결제. 각 단계에서 어떤 말이 마음을 움직이는지 정하세요.
4단계) 이 설득 포인트를 상세페이지 카피와 라이브 대본에 자연스럽게 녹이세요.

# 카피라이팅 가이드
- headline: "${coreTarget}"이 스크롤하다 멈출 만큼 구체적이고 감각적인 한 줄. "${productName}"과 핵심 혜택을 반드시 포함하세요. (예: "칙칙한 피부, 3일 만에 광채가 돌아왔어요" 수준의 구체성)
- subheadline: headline을 보고 "정말?" 하는 사람에게 "${usp}"로 바로 증거를 보여주는 한 줄.
- painPoints: "${coreTarget}"이 "맞아, 나도 그래!"라고 고개를 끄덕일 현실적이고 구체적인 불만 3가지.
- features: 단순 스펙 나열이 아니라 "이 기능이 당신의 일상에서 이렇게 달라져요" 형태. benefit은 감정에 호소하세요.
- trustSignals: 실감나는 리뷰 톤, 구체적 수치(%), 실제 있을 법한 인증/수상명을 만드세요.
- closingCTA: "${strongOffer}"를 활용해서 "지금 안 사면 후회한다"는 느낌을 주세요.

# 라이브커머스 대본 가이드
- 말투: 실제 한국 라이브커머스 진행자처럼 에너지 넘치고, 감탄사("대박!", "이거 진짜예요?!") 자연스럽게 사용하세요.
- hook: 시청자가 방송을 떠나지 못하게 호기심을 자극하는 한마디. "${productName}"의 가장 놀라운 특징을 활용하세요.
- demoPoints: 각 구간의 talkingPoint에 "${usp}"와 "${strongOffer}"를 자연스럽게 녹이세요. 시청자에게 말 거는 톤("여러분 보이세요?", "이거 실화예요!")을 사용하세요.
- qnaHandling: "${coreTarget}"이 실제로 물어볼 법한 현실적인 질문과, 안심시키면서 구매를 유도하는 답변.
- closing: 마지막 15초 안에 "지금 바로 주문해야 하는 이유"를 강하게 전달하세요.

# 응답 형식
다음 JSON 형식으로 정확히 응답하세요 (다른 텍스트 없이 JSON만):
{
  "landingPage": {
    "headline": "(스크롤을 멈추게 하는 구체적 카피)",
    "subheadline": "(USP를 증거로 보여주는 보충 카피)",
    "problemSection": {
      "title": "이런 고민 있으세요?",
      "painPoints": ["구체적 불만1", "구체적 불만2", "구체적 불만3"]
    },
    "features": [
      { "title": "특장점1 제목", "description": "기능 설명", "benefit": "감정에 호소하는 고객 이점" },
      { "title": "특장점2 제목", "description": "기능 설명", "benefit": "감정에 호소하는 고객 이점" },
      { "title": "특장점3 제목", "description": "기능 설명", "benefit": "감정에 호소하는 고객 이점" }
    ],
    "trustSignals": [
      { "type": "review", "content": "실감나는 고객 후기 (구체적 상황 포함)" },
      { "type": "stats", "content": "구체적 수치가 포함된 통계" },
      { "type": "certification", "content": "신뢰를 주는 인증/수상 정보" }
    ],
    "closingCTA": {
      "mainCopy": "지금 행동하게 만드는 마감 카피",
      "buttonText": "클릭하고 싶은 버튼 텍스트",
      "urgency": "긴급성 문구 (수량/기간 한정)"
    },
    "checklist": ["실전 체크 항목1", "항목2", "항목3", "항목4", "항목5"]
  },
  "liveCommerce": {
    "opening": {
      "greeting": "에너지 넘치는 인사말",
      "hook": "시청자가 못 떠나게 하는 호기심 한마디",
      "todaysOffer": "오늘만의 특별 제안 (구체적 혜택)"
    },
    "demoPoints": [
      { "timestamp": "0-1분", "action": "무엇을 보여줄지", "talkingPoint": "에너지 넘치는 실제 멘트" },
      { "timestamp": "1-3분", "action": "무엇을 보여줄지", "talkingPoint": "USP를 녹인 실제 멘트" },
      { "timestamp": "3-5분", "action": "무엇을 보여줄지", "talkingPoint": "비교하며 설득하는 멘트" },
      { "timestamp": "5-7분", "action": "무엇을 보여줄지", "talkingPoint": "구매 욕구를 자극하는 멘트" }
    ],
    "qnaHandling": [
      { "commonQuestion": "현실적 예상 질문1", "answer": "안심+구매유도 답변" },
      { "commonQuestion": "현실적 예상 질문2", "answer": "안심+구매유도 답변" },
      { "commonQuestion": "현실적 예상 질문3", "answer": "안심+구매유도 답변" }
    ],
    "closing": {
      "finalOffer": "마지막 결정타 제안",
      "urgencyTactic": "지금 안 사면 못 사는 이유",
      "farewell": "다음 방송 기대하게 하는 마무리"
    },
    "checklist": ["라이브 준비 항목1", "항목2", "항목3", "항목4", "항목5"]
  },
  "salesLogic": "**레포트 요약:**\\n1. (핵심 전략 1)\\n2. (핵심 전략 2)\\n3. (핵심 전략 3)\\n4. (핵심 전략 4)\\n5. (핵심 전략 5)\\n\\n(아래에 20줄 상세 세일즈 전략 레포트를 이어서 작성)"
}

# 규칙 (반드시 지키세요)
- 상세페이지는 AIDA 공식 (Attention→Interest→Desire→Action) 기반
- 라이브커머스는 오프닝→시연→Q&A→클로징 구조
- 모든 텍스트는 TOPIK 3급 수준 쉬운 한국어 (~해요 체)
- "${productName}"과 "${usp}"를 결과물 곳곳에 자연스럽게 녹이세요 (억지로 넣지 말고 문맥에 맞게)
- 교과서적이고 일반적인 표현 금지. "${productName}"에만 해당하는 구체적이고 생생한 카피를 쓰세요.
- 체크리스트는 마케팅 초보가 놓치기 쉬운 실전 항목 (상품 특성에 맞게)
- salesLogic은 반드시 아래 형식을 따르세요:
  * 맨 위에 "**레포트 요약:**" (굵은 글씨 마크다운)
  * 바로 아래에 핵심 전략 5가지를 번호 매겨서 정리 (각 1줄)
  * 빈 줄 1개
  * 그 아래에 20줄 상세 세일즈 전략 레포트 (\\n으로 줄바꿈)
  * "${productName}"의 구매 여정(발견→관심→비교→확신→결제)을 중심으로, 이 상세페이지와 라이브 전략이 각 단계에서 어떻게 작동하는지 설명
  * 하나의 레포트처럼 자연스럽게 이어지도록 작성
  * TOPIK 3급 수준 외국인이 이해하기 쉬운 한국어 (~해요 체)`;

      const text = await generateText(prompt);
      if (text) {
        const parsed = safeParseJSON(text);
        if (parsed.landingPage && parsed.liveCommerce && parsed.salesLogic) {
          return { result: parsed, isMock: false };
        }
      }
    } catch (err) {
      console.error('[PerfectPlanner] AI generation FAILED, falling back to mock:', err);
    }
  } else {
    console.warn('[PerfectPlanner] Gemini not enabled.');
  }

  return { result: getMockSalesPlan(productName, usp, strongOffer), isMock: true };
}

// ─── Mock 데이터 ───

function getMockSalesPlan(
  productName: string,
  usp: string,
  strongOffer: string,
): PerfectPlannerResult['output'] {
  return {
    landingPage: {
      headline: `${productName}, 이제 바꿀 때가 됐어요`,
      subheadline: `${usp || '당신이 찾던 바로 그 제품'}이 여기 있어요`,
      problemSection: {
        title: '이런 고민 있으세요?',
        painPoints: [
          '좋은 제품을 찾느라 시간을 많이 쓰고 있어요',
          '비싼 돈을 내고도 만족하지 못했어요',
          '진짜 효과 있는 제품인지 믿기 어려워요',
        ],
      },
      features: [
        {
          title: '차별화된 품질',
          description: `${usp || '다른 제품과 다른 특별한 점'}이 있어요`,
          benefit: '더 이상 여러 제품을 비교하지 않아도 돼요',
        },
        {
          title: '검증된 효과',
          description: '실제 사용자들이 인정한 만족도예요',
          benefit: '안심하고 선택할 수 있어요',
        },
        {
          title: '합리적인 가격',
          description: '좋은 품질을 부담 없는 가격에 제공해요',
          benefit: '가격 때문에 고민할 필요 없어요',
        },
      ],
      trustSignals: [
        { type: 'review', content: '"써보고 깜짝 놀랐어요! 주변에 다 추천하고 있어요" - 김○○님' },
        { type: 'stats', content: '구매 고객 만족도 95%, 재구매율 78%' },
        { type: 'certification', content: '한국 소비자 만족지수 1위 (2024)' },
      ],
      closingCTA: {
        mainCopy: `지금 ${productName}을 만나보세요`,
        buttonText: `${strongOffer || '특별 할인가'} 확인하기`,
        urgency: '이번 주까지만 이 가격! 한정 수량 200개',
      },
      checklist: [
        '메인 사진이 제품의 장점을 잘 보여주나요?',
        '고객 후기 사진을 3개 이상 넣었나요?',
        '배송/교환/반품 정보를 쉽게 찾을 수 있나요?',
        '가격과 할인 정보가 눈에 잘 보이나요?',
        '모바일에서도 글자가 잘 읽히나요?',
      ],
    },
    liveCommerce: {
      opening: {
        greeting: `안녕하세요 여러분! 오늘은 정말 특별한 제품을 가져왔어요!`,
        hook: `이거 보시면 바로 "이거다!" 하실 거예요. 진짜 대박이에요!`,
        todaysOffer: `${strongOffer || '오늘 방송에서만 특별 할인'} + 추가 사은품까지!`,
      },
      demoPoints: [
        {
          timestamp: '0-1분',
          action: '제품 박스 개봉, 첫인상 보여주기',
          talkingPoint: '패키지부터 다르죠? 이게 바로 프리미엄이에요!',
        },
        {
          timestamp: '1-3분',
          action: '제품 주요 기능 시연',
          talkingPoint: `${usp || '이 제품만의 특별한 점'}을 직접 보여드릴게요!`,
        },
        {
          timestamp: '3-5분',
          action: '비교 시연 (전/후 또는 타 제품과)',
          talkingPoint: '다른 제품이랑 비교해볼게요. 차이가 바로 느껴지시죠?',
        },
        {
          timestamp: '5-7분',
          action: '사용 팁 + 활용법 소개',
          talkingPoint: '이렇게 쓰면 효과가 2배! 꿀팁 알려드릴게요!',
        },
      ],
      qnaHandling: [
        {
          commonQuestion: '배송은 얼마나 걸려요?',
          answer: '주문 후 1-2일 안에 출발해요! 대부분 3일 이내에 받으실 수 있어요.',
        },
        {
          commonQuestion: '환불이 가능한가요?',
          answer: '네! 받으시고 7일 이내에 무조건 환불 가능해요. 걱정 마세요!',
        },
        {
          commonQuestion: '다른 제품이랑 뭐가 달라요?',
          answer: `${usp || '우리 제품만의 특별한 차별점'}이 가장 큰 차이예요!`,
        },
      ],
      closing: {
        finalOffer: '마지막으로 한번 더! 오늘 이 가격은 방송 끝나면 없어요!',
        urgencyTactic: '지금 남은 수량이 50개밖에 없어요! 품절되면 다음 방송까지 기다려야 해요!',
        farewell: '오늘도 시청해주셔서 감사해요! 좋은 제품으로 또 만나요!',
      },
      checklist: [
        '조명과 카메라 각도를 미리 확인했나요?',
        '시연용 제품과 비교 제품을 준비했나요?',
        '특별 할인 가격과 수량을 정확히 알고 있나요?',
        '예상 질문 답변을 연습했나요?',
        '마이크 테스트와 인터넷 연결을 확인했나요?',
      ],
    },
    salesLogic: `**레포트 요약:**\n1. AIDA 공식(주목→관심→욕구→행동)으로 상세페이지를 설계했어요\n2. 라이브커머스는 오프닝→시연→Q&A→클로징 4단계 구조예요\n3. 고객 불만을 먼저 공감한 뒤 해결책으로 제품을 제시해요\n4. 신뢰 요소(후기·통계·인증)로 구매 확신을 줘요\n5. 두 채널을 함께 활용하면 매출 효과가 2배예요\n\n${productName}의 판매 전략은 두 가지 채널을 활용해요.\n첫 번째는 상세페이지(랜딩페이지)예요.\nAIDA 공식으로 고객의 관심을 끌고 구매까지 연결해요.\n"이런 고민 있으세요?"로 시작하면 고객이 공감해요.\n그 다음 제품의 3가지 특장점을 보여줘요.\n고객 후기, 만족도 통계, 인증 정보로 신뢰를 줘요.\n마지막에 한정 혜택으로 지금 바로 사게 만들어요.\n두 번째는 라이브커머스예요.\n시작할 때 강렬한 한마디로 시청자를 잡아요.\n제품을 직접 보여주면서 장점을 설명해요.\n"다른 제품이랑 비교"하면 차이가 확실히 보여요.\n사용 팁을 알려주면 "나도 써보고 싶다"는 생각이 들어요.\n예상 질문 3개를 미리 준비하면 당황하지 않아요.\n"오늘 이 가격은 방송 끝나면 없어요!"가 마지막 설득이에요.\n상세페이지와 라이브를 같이 하면 효과가 커져요.\n상세페이지는 24시간 판매하고, 라이브는 실시간 신뢰를 줘요.\n체크리스트를 꼭 확인하면 준비가 완벽해져요.\n모바일에서 글자가 잘 읽히는지 꼭 확인하세요.\n고객 후기 사진을 3개 이상 넣으면 신뢰가 올라가요.\n이 전략을 따라하면 마케팅 초보도 매출을 올릴 수 있어요!`,
  };
}
