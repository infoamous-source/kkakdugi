import { generateText, isGeminiEnabled } from './geminiClient';
import { getMockCopyOptions } from '../../data/marketing/mockCopyOptions';
import type { CopywriterInput, CopywriterOutput } from '../../types/marketing';

/**
 * AI 카피라이터 서비스
 * Gemini API 사용 가능하면 AI 생성, 아니면 Mock 데이터 반환
 */
export async function generateCopy(input: CopywriterInput): Promise<CopywriterOutput> {
  // API 키가 있으면 Gemini 시도
  if (isGeminiEnabled()) {
    try {
      const toneMap: Record<string, string> = {
        emotional:
          '감성적이고 따뜻한 톤. 고객의 감정에 공감하고, 일상 속 작은 행복이나 추억을 떠올리게 하는 표현을 사용. 의성어·의태어를 활용하고, "~같은", "~처럼" 비유로 감성을 자극',
        fun: '재미있고 위트있는 톤. 말장난, 라임, 반전 유머를 활용. 읽는 사람이 피식 웃으며 기억에 남도록. 과장법이나 의외의 비교를 적극 사용',
        serious:
          '전문적이고 신뢰감 있는 톤. 구체적인 수치나 팩트를 강조하고, 군더더기 없이 핵심만 전달. 권위 있지만 딱딱하지 않게, 확신을 주는 문장 구조 사용',
        trendy:
          'Z세대 감성의 트렌디하고 힙한 톤. 요즘 유행하는 줄임말, 밈, SNS 감성을 반영. "~거든요", "~인 거 알지?" 같은 친근한 말투. 짧고 임팩트 있게',
        storytelling:
          '이야기를 들려주듯 자연스럽고 몰입감 있는 톤. "어느 날~", "그때~" 같은 서사적 시작. 고객이 주인공이 되는 짧은 스토리 구조로, 읽다 보면 자연스럽게 제품이 등장하도록',
      };

      const lengthMap: Record<string, string> = {
        short: '각 카피는 한 줄(15자 이내)로 짧게. 슬로건처럼 강렬하게',
        medium: '각 카피는 1~2문장으로. 핵심 메시지 + 보조 설명',
        long: '각 카피는 3~5문장으로 상세하게. 도입-전개-마무리 흐름을 갖추어',
      };

      const lengthInstruction = lengthMap[input.length || 'medium'];

      const prompt = `당신은 15년 경력의 한국 광고 카피라이터입니다. 식음료, 뷰티, 라이프스타일, 테크 등 다양한 업종의 히트 카피를 만들어온 전문가입니다. "쉬운 말로 마음을 움직인다"가 당신의 철학입니다.

[과제]
아래 제품 정보를 분석한 뒤, 광고 카피를 정확히 3개 만드세요.

[제품 정보]
- 상품/서비스: ${input.productName}
- 타겟 고객: ${input.target}
- 톤 & 스타일: ${toneMap[input.tone]}

[사고 과정 — 이 단계를 내부적으로 수행하되 출력에는 포함하지 마세요]
1단계: "${input.productName}"의 핵심 매력 포인트를 3가지 도출 (경쟁 제품 대비 차별점, 고객이 얻는 구체적 혜택, 감각적으로 와닿는 특징)
2단계: "${input.target}" 고객이 가장 반응할 감정적 트리거를 파악 (불편함 해소? 욕망 충족? 소속감? 자기표현?)
3단계: 1~2단계를 결합하여, 제품의 매력이 고객의 감정에 꽂히는 카피 생성

[좋은 카피의 기준]
- 구체적이어야 한다: "맛있는 빵" ✗ → "방금 오븐에서 나온 바삭한 빵" ✓
- 제품만의 특성이 드러나야 한다: 아무 제품에나 쓸 수 있는 문장은 실패
- 고객의 언어로 말해야 한다: 타겟이 실제로 쓰는 단어와 표현을 사용
- 한 가지 메시지에 집중해야 한다: 여러 장점을 나열하지 말고 하나를 깊게

[필수 제약]
- TOPIK 3급 수준의 쉬운 한국어만 사용 (어려운 한자어, 전문 용어 금지)
- ${lengthInstruction}
- 한국의 최신 문화와 트렌드 반영
- 각 카피는 서로 다른 매력 포인트나 감정에 호소해야 함 (3개가 비슷하면 안 됨)

[출력 형식]
카피 3개를 번호 없이 줄바꿈으로만 구분하여 출력하세요. 카피 외에 다른 텍스트는 절대 포함하지 마세요:`;

      const result = await generateText(prompt);
      if (result) {
        const copies = result
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 5)
          .slice(0, 3);

        if (copies.length >= 2) {
          return { copies, isMockData: false };
        }
      }
    } catch (err) {
      console.error('[CopywriterService] AI generation FAILED, falling back to mock:', err);
    }
  } else {
    console.warn('[CopywriterService] Gemini not enabled.');
  }

  // Mock 데이터 폴백
  const mockCopies = getMockCopyOptions(input.tone, input.productName);
  return { copies: mockCopies, isMockData: true };
}
