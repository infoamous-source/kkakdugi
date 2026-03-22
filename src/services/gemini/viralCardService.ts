import { generateText, isGeminiEnabled, getStoredApiKey } from './geminiClient';
import { GoogleGenAI } from '@google/genai';
import type { ViralCardSlide, ViralCardResult, ViralTone, ImageStyle } from '../../types/school';
import { safeParseJSON } from './jsonHelper';

// ─── 이미지 스타일 프리픽스 ───

const IMAGE_STYLE_PREFIX: Record<ImageStyle, string> = {
  illustration: 'cute colorful digital illustration, kawaii style, soft gradients, pastel colors',
  realistic: 'professional product photography, high quality, studio lighting, clean background',
  minimal: 'clean minimalist design, flat colors, simple shapes, white space, geometric',
  popart: 'bold pop art style, bright saturated colors, comic-like, retro halftone dots',
  custom: '', // user-uploaded image, no AI generation
};

// ─── Step 1: 카피 생성 ───

export async function generateViralCards(
  productName: string,
  targetPersona: string,
  usp: string,
  tone: ViralTone,
  imageStyle: ImageStyle,
): Promise<{ result: ViralCardResult['output']; isMock: boolean }> {
  if (isGeminiEnabled()) {
    try {
      const toneGuide: Record<ViralTone, string> = {
        spicy: '반말 + 도발적인 문체. "이거 모르면 손해!", "아직도 이렇게 해?" 같은 자극적인 표현을 써요.',
        emotional: '존댓말 + 따뜻한 공감. "당신을 위해 만들었어요", "힘들었죠?" 같은 감성적인 표현을 써요.',
        informative: '존댓말 + 객관적인 데이터. "3가지 선택 기준", "전문가가 추천하는" 같은 정보성 표현을 써요.',
      };

      const prompt = `당신은 인스타그램 바이럴 콘텐츠 전문가예요.
100만 팔로워 계정을 3개 이상 키운 경험이 있고, 카드뉴스 하나로 저장 1만 이상을 달성한 적이 많아요.
지금부터 실제로 바이럴될 카드뉴스 4장을 만들어주세요.

━━━ 브리프 ━━━
상품/브랜드: ${productName}
타겟 고객: ${targetPersona}
차별점(USP): ${usp}
톤: ${toneGuide[tone]}

━━━ 4단 바이럴 공식 (각 단계 역할을 반드시 지키세요) ━━━

1. HOOK (관심 끌기)
   - 역할: 피드에서 0.3초 안에 스크롤을 멈추게 하는 "첫 한 줄"
   - 테크닉: 충격적 숫자("97%가 모르는"), 질문형("아직도 이렇게 해?"), 반전("이건 절대 사지 마세요"), 대비("전 vs 후")
   - 이 카드만 봐도 "뭐지?" 하고 다음 장을 넘기게 만들어야 해요

2. EMPATHY (공감하기)
   - 역할: 타겟 고객이 "이거 완전 내 얘기인데?"라고 느끼게 만드는 감정 연결
   - 테크닉: 구체적 상황 묘사("퇴근하고 거울 보면 지친 얼굴…"), 감정 단어("답답하죠?", "속상했죠?"), 타겟의 일상 언어 사용
   - 막연한 공감이 아니라, 타겟의 구체적인 일상 고민을 정확히 짚어야 해요

3. SOLUTION (해결책)
   - 역할: "이 제품이 왜 답인지" 한눈에 이해시키는 핵심 장
   - 테크닉: 구체적 수치("48시간 지속", "3일 만에 효과"), 비교("기존 제품 대비 2배"), USP를 1문장으로 압축
   - 기능 나열이 아니라 고객 관점에서 "나한테 어떤 변화가 생기는지" 보여줘야 해요

4. ACTION (행동 유도)
   - 역할: 지금 당장 행동하게 만드는 마지막 터치
   - 테크닉: 긴급함("오늘만", "한정 수량"), 저항 제거("무료 체험", "30초면 끝"), 소셜 프루프("10만 명이 선택한")
   - 카드뉴스를 본 사람이 바로 프로필 링크를 누르게 만들어야 해요

━━━ JSON 형식 (다른 텍스트 없이 JSON만 응답) ━━━
{
  "slides": [
    {
      "step": "hook",
      "stepLabel": "HOOK",
      "copyText": "2-3줄. 짧고 강렬하게. 숫자·질문·반전 중 하나를 반드시 포함",
      "imagePrompt": "영어. 40단어 이상. 구도(close-up/aerial/eye-level), 주요 피사체, 배경, 색감(warm golden/cool blue 등), 조명(soft diffused/dramatic rim light), 분위기(cozy/energetic)를 모두 포함. NO text, NO letters, NO words, NO logos",
      "colorScheme": { "primary": "#HEX", "secondary": "#HEX", "gradient": "linear-gradient(135deg, #HEX 0%, #HEX 100%)" },
      "designTip": "레이아웃·타이포그래피·여백·시선흐름 등 구체적인 디자인 조언"
    },
    {
      "step": "empathy",
      "stepLabel": "EMPATHY",
      "copyText": "...",
      "imagePrompt": "...",
      "colorScheme": { "primary": "#HEX", "secondary": "#HEX", "gradient": "..." },
      "designTip": "..."
    },
    {
      "step": "solution",
      "stepLabel": "SOLUTION",
      "copyText": "...",
      "imagePrompt": "...",
      "colorScheme": { "primary": "#HEX", "secondary": "#HEX", "gradient": "..." },
      "designTip": "..."
    },
    {
      "step": "action",
      "stepLabel": "ACTION",
      "copyText": "...",
      "imagePrompt": "...",
      "colorScheme": { "primary": "#HEX", "secondary": "#HEX", "gradient": "..." },
      "designTip": "..."
    }
  ],
  "overallStrategy": "**레포트 요약:**\\n1. (핵심 포인트 1)\\n2. (핵심 포인트 2)\\n3. (핵심 포인트 3)\\n4. (핵심 포인트 4)\\n5. (핵심 포인트 5)\\n\\n(아래에 20줄 상세 콘텐츠 전략 레포트를 이어서 작성)"
}

━━━ 규칙 (반드시 지키세요) ━━━

[copyText 규칙]
- TOPIK 3급 수준 쉬운 한국어 (외국인도 이해할 수 있는 ~해요/~야 체)
- 각 카드 2-3줄, 한 줄당 15자 이내
- 구체적 숫자, 감정 트리거, 호기심 유발 요소를 반드시 1개 이상 포함
- 제품 이름을 4장 중 최소 2장에 자연스럽게 넣기
- 같은 문장 구조를 반복하지 말 것 (질문형→서술형→감탄형→명령형 등 변화를 주세요)

[imagePrompt 규칙]
- 영어로 작성, 반드시 40단어 이상으로 구체적으로 묘사
- ${IMAGE_STYLE_PREFIX[imageStyle]} 스타일에 맞게
- 구성요소를 반드시 포함: (1)구도/앵글 (2)주요 피사체 (3)배경/환경 (4)색감/톤 (5)조명 (6)분위기/무드
- 제품과 관련된 구체적인 시각 요소를 넣되, 텍스트는 절대 생성하지 않도록 "NO text, NO letters, NO words, NO logos" 포함
- 4장이 하나의 시리즈처럼 보이도록 일관된 시각 요소(색감, 피사체, 톤)를 유지하되, 단계별로 감정 변화를 반영

[colorScheme 규칙]
- 4장 전체가 하나의 브랜드 팔레트처럼 통일감 있어야 해요
- 하나의 메인 컬러 패밀리를 정하고, 단계별로 명도/채도를 변화시키세요
  예: HOOK(진한 채도, 주목) → EMPATHY(낮은 명도, 차분) → SOLUTION(밝은 톤, 희망) → ACTION(높은 채도, 에너지)
- primary와 secondary 색상은 서로 조화로워야 하고, gradient는 두 색의 자연스러운 전환이어야 해요
- 배경 위에 흰색 텍스트가 잘 보이는 충분한 명도 대비를 확보하세요

[designTip 규칙]
- 쉬운 한국어로 작성
- 추상적인 조언("강렬하게 만들어요") 대신 구체적인 실행 가이드를 주세요
  예: "카피를 카드 상단 1/3에 왼쪽 정렬로 배치하고, 하단 2/3에 이미지를 배치해요. 카피 글자 크기는 배경 대비 눈에 띄게 24pt 이상으로"

[overallStrategy 규칙]
- 반드시 아래 형식을 따르세요:
  * 맨 위에 "**레포트 요약:**" (굵은 글씨 마크다운)
  * 바로 아래에 핵심 포인트 5가지를 번호 매겨서 정리 (각 1줄)
  * 빈 줄 1개
  * 그 아래에 20줄 상세 콘텐츠 전략 레포트 (\\n으로 줄바꿈)
  * 이 4장의 카드뉴스가 왜 효과적인지, 각 단계가 어떤 역할을 하는지, 타겟 고객에게 어떻게 어필하는지 설명
  * 하나의 레포트처럼 자연스럽게 이어지도록 작성
  * TOPIK 3급 수준 외국인이 이해하기 쉬운 한국어 (~해요 체)`;

      const text = await generateText(prompt);
      if (text) {
        const parsed = safeParseJSON(text);
        if (parsed.slides && parsed.slides.length === 4 && parsed.overallStrategy) {
          return { result: parsed, isMock: false };
        }
      }
    } catch (err) {
      console.error('[ViralCard] AI copy generation FAILED, falling back to mock:', err);
    }
  } else {
    console.warn('[ViralCard] Gemini not enabled.');
  }

  return { result: getMockViralCards(productName, usp, tone), isMock: true };
}

// ─── Step 2: 이미지 생성 ───

export async function generateSlideImage(
  imagePrompt: string,
  imageStyle: ImageStyle,
): Promise<string | null> {
  const apiKey = getStoredApiKey();
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const fullPrompt = `${IMAGE_STYLE_PREFIX[imageStyle]}, ${imagePrompt}. NO text, NO letters, NO words, NO logos in the image. Leave space in center for text overlay. Square 1:1 aspect ratio.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-image-generation',
      contents: fullPrompt,
      config: {
        responseModalities: ['Text', 'Image'],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data ?? null;
      }
    }
    return null;
  } catch (err) {
    console.error('[ViralCard] Image generation FAILED:', err);
    return null;
  }
}

export async function generateAllSlideImages(
  slides: ViralCardSlide[],
  imageStyle: ImageStyle,
  onImageReady?: (index: number, base64: string | null) => void,
): Promise<(string | null)[]> {
  const results = await Promise.allSettled(
    slides.map(async (slide, index) => {
      const base64 = await generateSlideImage(slide.imagePrompt, imageStyle);
      onImageReady?.(index, base64);
      return base64;
    }),
  );

  return results.map((r) => (r.status === 'fulfilled' ? r.value : null));
}

// ─── Mock 데이터 ───

function getMockViralCards(
  productName: string,
  usp: string,
  tone: ViralTone,
): ViralCardResult['output'] {
  const toneMap: Record<ViralTone, { slides: Omit<ViralCardSlide, 'imageBase64'>[]; strategy: string }> = {
    spicy: {
      slides: [
        {
          step: 'hook',
          stepLabel: 'HOOK',
          copyText: `아직도 ${productName} 안 써봤어?\n이거 모르면 진짜 손해야!`,
          imagePrompt: `eye-catching product showcase of ${productName}, dramatic lighting, attention-grabbing`,
          colorScheme: { primary: '#FF4757', secondary: '#FF6B81', gradient: 'linear-gradient(135deg, #FF4757 0%, #FF6B81 100%)' },
          designTip: '강렬한 빨간색 배경에 큰 글씨로 시선을 확 끌어요',
        },
        {
          step: 'empathy',
          stepLabel: 'EMPATHY',
          copyText: '맨날 비싼 돈 주고 사놓고\n효과도 없고 후회만 했지?',
          imagePrompt: `frustrated person looking at disappointing products, emotional scene`,
          colorScheme: { primary: '#5F27CD', secondary: '#A55EEA', gradient: 'linear-gradient(135deg, #5F27CD 0%, #A55EEA 100%)' },
          designTip: '보라색 톤으로 공감가는 감정을 표현해요',
        },
        {
          step: 'solution',
          stepLabel: 'SOLUTION',
          copyText: `${usp || '다른 제품과는 차원이 다른'}\n이게 진짜 답이야!`,
          imagePrompt: `amazing product transformation, before and after, impressive results`,
          colorScheme: { primary: '#0ABF53', secondary: '#2ECC71', gradient: 'linear-gradient(135deg, #0ABF53 0%, #2ECC71 100%)' },
          designTip: '초록색으로 해결 느낌을 주고 제품 사진을 넣어요',
        },
        {
          step: 'action',
          stepLabel: 'ACTION',
          copyText: '지금 안 사면 후회할 걸?\n링크 눌러서 바로 확인해!',
          imagePrompt: `call to action, pointing arrow, exciting offer, urgency`,
          colorScheme: { primary: '#FF9F43', secondary: '#FECA57', gradient: 'linear-gradient(135deg, #FF9F43 0%, #FECA57 100%)' },
          designTip: '주황색+노란색으로 긴급한 느낌을 줘요',
        },
      ],
      strategy: `**레포트 요약:**\n1. "자극적인 톤"으로 스크롤을 멈추게 해요\n2. HOOK → EMPATHY → SOLUTION → ACTION 4단계 공식이에요\n3. 고객의 불만에 공감한 뒤 해결책을 제시해요\n4. "${productName}"의 차별점을 강하게 어필해요\n5. 긴급함으로 즉시 행동을 유도해요\n\n이 카드뉴스는 자극적인 톤으로 호기심을 유발해요.\n첫 번째 카드(HOOK)에서 강렬한 빨간색으로 시선을 끌어요.\n"아직도 안 써봤어?" 같은 도발적인 문구가 스크롤을 멈추게 해요.\n두 번째 카드(EMPATHY)에서 고객의 고민에 공감해요.\n"돈 주고 사도 효과 없었지?"로 공감을 끌어내요.\n세 번째 카드(SOLUTION)에서 우리 제품이 답이라고 알려줘요.\n${productName}의 차별점을 직관적으로 보여줘요.\n네 번째 카드(ACTION)에서 지금 바로 행동하라고 해요.\n"지금 안 사면 후회할 걸?"로 긴급함을 만들어요.\n이 4단계 공식은 SNS에서 가장 효과적인 구조예요.\n각 단계마다 다른 색상으로 시각적 변화를 줘요.\n글씨는 짧고 강렬하게 2-3줄만 써요.\n이미지는 텍스트 없이 감정을 전달해요.\n이런 구조는 인스타그램 카드뉴스에 최적화되어 있어요.\n스와이프할수록 궁금해지는 구조라 완독률이 높아요.\n타겟 고객이 "나 얘기"라고 느끼게 만드는 게 핵심이에요.\n마지막에 CTA(행동 유도)로 자연스럽게 구매를 연결해요.\n이 전략은 특히 10-30대 MZ세대에게 잘 통해요.\n자극적인 톤이 공유를 유도해서 바이럴 효과도 있어요.\n"${productName}"의 차별점이 자연스럽게 기억에 남아요.`,
    },
    emotional: {
      slides: [
        {
          step: 'hook',
          stepLabel: 'HOOK',
          copyText: `매일 열심히 사는 당신을 위해\n${productName}을 준비했어요`,
          imagePrompt: `warm cozy scene, soft lighting, comforting atmosphere, gentle mood`,
          colorScheme: { primary: '#E84393', secondary: '#FD79A8', gradient: 'linear-gradient(135deg, #E84393 0%, #FD79A8 100%)' },
          designTip: '따뜻한 핑크톤으로 부드러운 첫인상을 줘요',
        },
        {
          step: 'empathy',
          stepLabel: 'EMPATHY',
          copyText: '좋은 제품을 찾느라\n고민 많으셨죠?\n그 마음 잘 알아요',
          imagePrompt: `person thoughtfully choosing products, gentle expression, relatable moment`,
          colorScheme: { primary: '#6C5CE7', secondary: '#A29BFE', gradient: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)' },
          designTip: '부드러운 보라색으로 이해하는 마음을 표현해요',
        },
        {
          step: 'solution',
          stepLabel: 'SOLUTION',
          copyText: `${usp || '정성을 담아 만든'}\n당신의 고민을\n이제 해결해드릴게요`,
          imagePrompt: `heartwarming product presentation, gift-like, caring atmosphere`,
          colorScheme: { primary: '#00B894', secondary: '#55EFC4', gradient: 'linear-gradient(135deg, #00B894 0%, #55EFC4 100%)' },
          designTip: '민트색으로 안심과 신뢰 느낌을 줘요',
        },
        {
          step: 'action',
          stepLabel: 'ACTION',
          copyText: '오늘부터 시작해보세요\n당신은 이런 좋은 것을\n받을 자격이 있어요',
          imagePrompt: `person smiling with product, happy satisfied moment, warm ending`,
          colorScheme: { primary: '#FDCB6E', secondary: '#F9CA24', gradient: 'linear-gradient(135deg, #FDCB6E 0%, #F9CA24 100%)' },
          designTip: '따뜻한 노란색으로 긍정적인 마무리를 해요',
        },
      ],
      strategy: `**레포트 요약:**\n1. 감성적인 톤으로 고객의 마음을 따뜻하게 움직여요\n2. "당신을 위한 선물"이라는 컨셉으로 특별함을 줘요\n3. 공감 → 이해 → 해결 → 응원의 감정 흐름이에요\n4. 핑크·보라·민트·노랑의 따뜻한 컬러가 감정을 전달해요\n5. 마지막 카드에서 자연스럽게 구매 동기를 만들어요\n\n이 카드뉴스는 감성적인 톤으로 고객의 마음을 움직여요.\n첫 번째 카드에서 "매일 열심히 사는 당신을 위해"로 시작해요.\n이렇게 하면 고객이 "나한테 말하는 거구나"라고 느껴요.\n두 번째 카드에서 고객의 고민을 이해한다고 말해요.\n"그 마음 잘 알아요"라는 말이 공감을 끌어내요.\n세 번째 카드에서 ${productName}이 해결책이라고 알려줘요.\n"고민을 해결해드릴게요"라는 따뜻한 약속을 해요.\n네 번째 카드에서 "당신은 이런 좋은 것을 받을 자격이 있어요"로 마무리해요.\n이런 응원의 메시지가 구매 동기를 자연스럽게 만들어요.\n감성적인 톤은 특히 여성 고객에게 잘 통해요.\n따뜻한 컬러 팔레트가 브랜드 이미지를 부드럽게 만들어요.\n각 카드의 색상이 감정의 변화를 시각적으로 보여줘요.\n짧고 따뜻한 문장이 카드뉴스에 딱 맞아요.\n이미지도 따뜻하고 부드러운 분위기로 통일해요.\n스와이프할수록 감정이 깊어지는 구조예요.\n마지막에 "시작해보세요"로 부담 없는 행동을 유도해요.\n이 전략은 ${productName}을 선물 같은 존재로 포지셔닝해요.\n감성 마케팅은 브랜드 충성도를 높이는 데 효과적이에요.\n고객이 브랜드에 감정적으로 연결되면 재구매율이 올라가요.\n이런 따뜻한 콘텐츠는 저장·공유율이 높아서 바이럴에도 좋아요.`,
    },
    informative: {
      slides: [
        {
          step: 'hook',
          stepLabel: 'HOOK',
          copyText: `${productName} 선택 전\n꼭 알아야 할 3가지`,
          imagePrompt: `professional infographic style, data chart, clean information layout`,
          colorScheme: { primary: '#0984E3', secondary: '#74B9FF', gradient: 'linear-gradient(135deg, #0984E3 0%, #74B9FF 100%)' },
          designTip: '파란색으로 신뢰감 있는 정보 느낌을 줘요',
        },
        {
          step: 'empathy',
          stepLabel: 'EMPATHY',
          copyText: '전문가 조사 결과\n소비자 78%가\n같은 고민을 하고 있어요',
          imagePrompt: `survey results, statistics visualization, research data, professional`,
          colorScheme: { primary: '#636E72', secondary: '#B2BEC3', gradient: 'linear-gradient(135deg, #636E72 0%, #B2BEC3 100%)' },
          designTip: '차분한 회색으로 객관적인 데이터 느낌을 줘요',
        },
        {
          step: 'solution',
          stepLabel: 'SOLUTION',
          copyText: `${usp || '검증된 품질과 합리적 가격'}\n만족도 95% 이상\n재구매율 Top 3`,
          imagePrompt: `product comparison chart, quality certification, award badge`,
          colorScheme: { primary: '#00CEC9', secondary: '#81ECEC', gradient: 'linear-gradient(135deg, #00CEC9 0%, #81ECEC 100%)' },
          designTip: '청록색으로 데이터 기반 신뢰감을 줘요',
        },
        {
          step: 'action',
          stepLabel: 'ACTION',
          copyText: '지금 프로필 링크에서\n상세 정보를 확인하세요\n첫 구매 혜택도 있어요',
          imagePrompt: `clean call to action, professional button design, special offer badge`,
          colorScheme: { primary: '#6C5CE7', secondary: '#A29BFE', gradient: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)' },
          designTip: '보라색 포인트로 깔끔한 CTA를 만들어요',
        },
      ],
      strategy: `**레포트 요약:**\n1. 객관적인 데이터로 ${productName}의 신뢰도를 높여요\n2. "꼭 알아야 할 3가지"로 정보 욕구를 자극해요\n3. 통계·인증·수치를 활용해서 설득력을 높여요\n4. 파란색·회색 등 차분한 컬러로 전문성을 보여줘요\n5. 정보를 준 뒤 자연스럽게 구매 행동을 유도해요\n\n이 카드뉴스는 정보 중심 접근으로 신뢰를 쌓아요.\n첫 번째 카드에서 "꼭 알아야 할 3가지"로 궁금증을 유발해요.\n정보를 찾는 고객에게 "이건 봐야 해"라는 느낌을 줘요.\n두 번째 카드에서 실제 통계 데이터를 보여줘요.\n"78%가 같은 고민을 한다"는 숫자가 공감을 만들어요.\n세 번째 카드에서 만족도와 재구매율 데이터를 제시해요.\n숫자로 보여주면 "이건 진짜구나"라는 신뢰가 생겨요.\n네 번째 카드에서 "상세 정보 확인하세요"로 안내해요.\n첫 구매 혜택을 함께 알려주면 행동을 유도할 수 있어요.\n정보형 콘텐츠는 특히 30-40대 고객에게 효과적이에요.\n감정보다 이성적으로 결정하는 고객을 설득해요.\n파란색·회색 톤이 신뢰감과 전문성을 전달해요.\n각 카드가 인포그래픽 스타일로 깔끔해요.\n복잡한 정보를 쉽게 요약하는 게 핵심이에요.\n이 구조는 제품 비교 시 선택 기준을 제공해요.\n"왜 이 제품인지" 논리적 근거를 보여줘요.\n정보형 콘텐츠는 저장률이 높아서 장기적으로 노출돼요.\n한번 만들면 오래 쓸 수 있는 에버그린 콘텐츠예요.\n이 전략은 ${productName}을 "전문가가 추천하는 제품"으로 포지셔닝해요.\n데이터 기반 마케팅은 고객의 구매 결정을 확실하게 도와줘요.`,
    },
  };

  return {
    slides: toneMap[tone].slides,
    overallStrategy: toneMap[tone].strategy,
  };
}
