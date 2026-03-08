import { generateText, isGeminiEnabled } from './geminiClient';
import type { ROASSimulationInput, ROASSimulationOutput } from '../../types/school';
import { safeParseJSON } from './jsonHelper';

// ─── 채널별 벤치마크 ───

const CHANNEL_BENCHMARKS: Record<ROASSimulationInput['adChannel'], {
  ctrRange: [number, number];
  cvrRange: [number, number];
  cpcRange: [number, number];
}> = {
  instagram: { ctrRange: [0.8, 2.0], cvrRange: [1.0, 3.0], cpcRange: [200, 500] },
  naver: { ctrRange: [1.0, 3.0], cvrRange: [2.0, 5.0], cpcRange: [150, 400] },
  kakao: { ctrRange: [0.5, 1.5], cvrRange: [1.0, 2.0], cpcRange: [100, 300] },
  youtube: { ctrRange: [0.3, 1.0], cvrRange: [0.5, 2.0], cpcRange: [300, 800] },
};

// ─── ROAS 시뮬레이션 ───

export async function simulateROAS(
  input: ROASSimulationInput,
  contextData?: { usp?: string; brandMood?: string },
): Promise<{ result: ROASSimulationOutput; isMock: boolean }> {
  if (isGeminiEnabled()) {
    try {
      const channelNames: Record<string, string> = {
        instagram: '인스타그램',
        naver: '네이버',
        kakao: '카카오톡',
        youtube: '유튜브',
      };

      const benchmarks = CHANNEL_BENCHMARKS[input.adChannel];

      const channelExpertise: Record<string, string> = {
        instagram: `인스타그램 광고 전문 지식:
- 피드 광고 평균 CPM: 5,000~12,000원, 스토리 광고 CPM: 3,000~8,000원
- 릴스 광고가 피드 대비 도달률 2~3배 높음 (2024 기준)
- 18~34세 타겟이 가장 반응 좋고, 45세+ 타겟은 전환율 낮음
- 해시태그 10~15개 + 위치 태그 사용 시 노출 20~30% 증가
- 비주얼 중심 상품(패션/뷰티/음식)이 ROAS 높음, 무형 서비스는 낮음`,
        naver: `네이버 검색광고(SA) 전문 지식:
- 파워링크 평균 CPC: 200~800원 (키워드 경쟁도에 따라 차이 큼)
- 쇼핑검색 광고 CVR이 파워링크 대비 1.5~2배 높음
- 브랜드검색 광고는 CTR 15~25%로 매우 높지만 비용도 높음
- 네이버 검색 사용자는 구매 의도가 높아 전환율이 SNS 대비 우수
- 모바일 비중 75%+ → 모바일 랜딩페이지 최적화 필수`,
        kakao: `카카오 광고 전문 지식:
- 카카오톡 비즈메시지 평균 오픈율: 40~60%, 클릭률: 2~5%
- 카카오모먼트 디스플레이 광고 CTR: 0.3~1.2%
- 친구 추가 광고 → 리타겟팅 메시지 조합이 효과적
- 쿠폰/할인 메시지는 일반 메시지 대비 클릭률 2배
- 30~50대 타겟에 특히 강하며, 10~20대 타겟은 효율 낮음`,
        youtube: `유튜브 광고 전문 지식:
- 트루뷰 인스트림(스킵 가능) 평균 CPV: 20~60원
- 범퍼 광고(6초) CPM: 3,000~7,000원, 인지도 캠페인에 적합
- 처음 5초 이탈률 60~70% → 첫 장면이 가장 중요
- 15~30초 영상이 전환 캠페인에 최적
- 자막 추가 시 조회 완료율 15~20% 향상 (소리 끄고 보는 비율 높음)`,
      };

      const prompt = `## 역할
당신은 한국 퍼포먼스 마케팅 10년차 실전 전문가예요.
메타(인스타그램) 광고, 네이버 검색광고(SA), 카카오모먼트, 유튜브 광고를 직접 운영한 경험이 있어요.
수백 개 캠페인의 ROAS를 분석하고 최적화해 본 전문가 관점에서 시뮬레이션해요.

## 입력 데이터
- 상품명: "${input.productName}"
- 상품 가격: ${input.productPrice.toLocaleString()}원 (= ${input.productPrice}원)
- 광고 예산: ${input.adBudget.toLocaleString()}원 (= ${input.adBudget}원)
- 광고 채널: ${channelNames[input.adChannel]}
- 타겟 연령: ${input.targetAge}
- 광고 기간: ${input.duration}일
${contextData?.usp ? `- 차별점(USP): ${contextData.usp}` : ''}
${contextData?.brandMood ? `- 브랜드 무드: ${contextData.brandMood}` : ''}

## ${channelNames[input.adChannel]} 벤치마크 (한국 시장 기준)
- CTR(클릭률): ${benchmarks.ctrRange[0]}% ~ ${benchmarks.ctrRange[1]}%
- CVR(전환률): ${benchmarks.cvrRange[0]}% ~ ${benchmarks.cvrRange[1]}%
- CPC(클릭당비용): ${benchmarks.cpcRange[0]}원 ~ ${benchmarks.cpcRange[1]}원

## ${channelNames[input.adChannel]} 채널 전문 지식
${channelExpertise[input.adChannel]}

## 계산 공식 (반드시 이 공식대로 계산하세요)
1. CPC를 벤치마크 범위 내에서 상품·타겟에 맞게 결정 (원 단위 정수)
2. estimatedClicks = Math.round(광고예산 / CPC)
3. estimatedImpressions = Math.round(estimatedClicks / (CTR% / 100))
4. estimatedConversions = Math.round(estimatedClicks × (CVR% / 100))
5. estimatedRevenue = estimatedConversions × 상품가격(${input.productPrice})
6. estimatedROAS = round(estimatedRevenue / 광고예산(${input.adBudget}), 소수점1자리)
7. costPerClick = CPC (원 단위 정수)
8. costPerConversion = estimatedConversions > 0 ? Math.round(광고예산 / estimatedConversions) : 0

## CTR·CVR·CPC 결정 가이드
- 벤치마크 범위 안에서 상품 특성과 타겟 연령을 고려해 현실적인 값을 선택하세요.
- 예: 비주얼 중심 상품(패션/뷰티/음식)이면 인스타그램 CTR을 높게, 무형 서비스면 낮게.
- 예: 고가 상품이면 CVR을 낮게, 저가 상품이면 CVR을 높게.
- 예: ${input.targetAge} 타겟이 해당 채널의 주력 연령대인지 고려.

## 응답 형식
다음 JSON 형식으로 정확히 응답하세요 (다른 텍스트 없이 JSON만):
{
  "estimatedImpressions": 숫자,
  "estimatedClicks": 숫자,
  "estimatedCTR": 숫자(소수점1자리, 예: 1.4),
  "estimatedConversions": 숫자,
  "estimatedCVR": 숫자(소수점1자리, 예: 2.5),
  "estimatedRevenue": 숫자,
  "estimatedROAS": 숫자(소수점1자리, 예: 2.3),
  "costPerClick": 숫자,
  "costPerConversion": 숫자,
  "roasGrade": "excellent" 또는 "good" 또는 "average" 또는 "poor",
  "advice": ["조언1", "조언2", "조언3"],
  "channelTip": "채널 맞춤 팁",
  "analysisReport": "**레포트 요약:**\\n1. (인사이트1)\\n2. (인사이트2)\\n3. (인사이트3)\\n4. (인사이트4)\\n5. (인사이트5)\\n\\n(20줄 상세 분석)"
}

## 각 필드 작성 규칙

### roasGrade 기준
- estimatedROAS 3.0 이상 → "excellent"
- estimatedROAS 2.0 이상 → "good"
- estimatedROAS 1.0 이상 → "average"
- estimatedROAS 1.0 미만 → "poor"

### advice (3개)
- 일반적인 팁이 아니라, "${input.productName}"을 "${channelNames[input.adChannel]}"에서 "${input.targetAge}" 타겟에게 광고할 때의 구체적인 실전 팁을 쓰세요.
- 예산 ${input.adBudget.toLocaleString()}원 규모에 맞는 현실적 조언을 쓰세요.
- 각 조언은 "~하면 ~가 ~% 정도 좋아질 수 있어요" 식으로 기대 효과를 포함하세요.

### channelTip
- "${input.productName}" 상품이 "${channelNames[input.adChannel]}"에서 성과를 내려면 어떤 광고 소재(이미지/영상/텍스트)를 어떻게 만들면 좋은지 구체적으로 쓰세요.

### analysisReport
- 반드시 아래 형식을 따르세요:
  * 맨 위에 "**레포트 요약:**" (굵은 글씨 마크다운)
  * 핵심 인사이트 5가지를 번호(1~5)로 정리 (각 1줄)
  * 빈 줄 1개 (\\n\\n)
  * 그 아래에 20줄 상세 분석 레포트 (\\n으로 줄바꿈)
- 상세 레포트에 반드시 포함할 내용:
  * 입력 데이터 인용: "예산 ${input.adBudget.toLocaleString()}원으로 ${input.duration}일간…" 처럼 구체적 수치를 언급
  * 이 ROAS가 의미하는 것 (좋은지/나쁜지, 업계 평균 대비)
  * 예산 배분 최적화 방법 (일 예산 = ${Math.round(input.adBudget / input.duration).toLocaleString()}원/일 기준)
  * "${channelNames[input.adChannel]}" 채널에서 "${input.productName}" 상품의 강점과 약점
  * ROAS를 더 높이기 위한 구체적 개선 방향 2~3가지
  * 하나의 레포트처럼 자연스럽게 이어지도록 작성

## 언어 규칙
- 모든 텍스트는 TOPIK 3급 수준 쉬운 한국어로 쓰세요
- ~해요 체를 사용하세요
- 어려운 마케팅 용어는 괄호 안에 쉬운 설명을 넣으세요 (예: "CTR(클릭률)")
- 외국인 학습자가 쉽게 읽을 수 있도록 짧은 문장을 사용하세요`;

      const text = await generateText(prompt);
      if (text) {
        const parsed = safeParseJSON(text);
        if (parsed.estimatedROAS !== undefined && parsed.advice) {
          return { result: parsed, isMock: false };
        }
      }
    } catch (err) {
      console.error('[ROASSimulator] AI simulation FAILED, falling back to mock:', err);
    }
  } else {
    console.warn('[ROASSimulator] Gemini not enabled.');
  }

  return { result: getMockROASSimulation(input), isMock: true };
}

// ─── Mock 시뮬레이션 ───

function getMockROASSimulation(input: ROASSimulationInput): ROASSimulationOutput {
  const bench = CHANNEL_BENCHMARKS[input.adChannel];

  // 벤치마크 중간값으로 계산
  const ctr = (bench.ctrRange[0] + bench.ctrRange[1]) / 2;
  const cvr = (bench.cvrRange[0] + bench.cvrRange[1]) / 2;
  const cpc = (bench.cpcRange[0] + bench.cpcRange[1]) / 2;

  const estimatedClicks = Math.round(input.adBudget / cpc);
  const estimatedImpressions = Math.round(estimatedClicks / (ctr / 100));
  const estimatedConversions = Math.round(estimatedClicks * (cvr / 100));
  const estimatedRevenue = estimatedConversions * input.productPrice;
  const estimatedROAS = Number((estimatedRevenue / input.adBudget).toFixed(1));
  const costPerConversion = estimatedConversions > 0
    ? Math.round(input.adBudget / estimatedConversions)
    : 0;

  let roasGrade: ROASSimulationOutput['roasGrade'];
  if (estimatedROAS >= 3.0) roasGrade = 'excellent';
  else if (estimatedROAS >= 2.0) roasGrade = 'good';
  else if (estimatedROAS >= 1.0) roasGrade = 'average';
  else roasGrade = 'poor';

  const channelTips: Record<string, string> = {
    instagram: '인스타그램에서는 사진과 릴스(짧은 영상)가 가장 효과가 좋아요. 해시태그를 10-15개 정도 붙이고, 스토리 광고도 함께 활용해보세요!',
    naver: '네이버에서는 검색 광고가 효과가 좋아요. 핵심 키워드를 잘 선택하고, 파워링크와 쇼핑검색 광고를 함께 사용해보세요!',
    kakao: '카카오톡에서는 타겟 메시지가 중요해요. 고객의 나이, 관심사에 맞는 메시지를 보내고, 쿠폰을 함께 넣으면 효과가 좋아요!',
    youtube: '유튜브에서는 처음 5초가 승부예요! 짧고 강렬한 영상으로 시작하고, 스킵할 수 없는 6초 범퍼 광고도 시도해보세요!',
  };

  const adviceMap: Record<string, string[]> = {
    instagram: [
      '스토리 광고를 추가하면 노출이 더 늘어날 수 있어요',
      '해시태그를 전략적으로 10-15개 사용해보세요',
      '릴스(짧은 영상) 콘텐츠가 요즘 가장 인기가 많아요',
    ],
    naver: [
      '핵심 키워드 외에 연관 키워드도 추가해보세요',
      '쇼핑검색 광고를 함께 사용하면 전환율이 올라갈 수 있어요',
      '블로그 체험단을 병행하면 신뢰도가 높아져요',
    ],
    kakao: [
      '타겟 연령을 더 좁히면 효율이 올라갈 수 있어요',
      '할인 쿠폰을 메시지에 넣으면 클릭률이 올라가요',
      '카카오 비즈보드 광고도 함께 시도해보세요',
    ],
    youtube: [
      '영상 처음 5초에 핵심 메시지를 넣어야 해요',
      '6초 범퍼 광고로 브랜드 인지도를 높여보세요',
      '자막을 꼭 넣어야 소리 없이 보는 사람도 이해할 수 있어요',
    ],
  };

  return {
    estimatedImpressions,
    estimatedClicks,
    estimatedCTR: Number(ctr.toFixed(1)),
    estimatedConversions,
    estimatedCVR: Number(cvr.toFixed(1)),
    estimatedRevenue,
    estimatedROAS,
    costPerClick: Math.round(cpc),
    costPerConversion,
    roasGrade,
    advice: adviceMap[input.adChannel],
    channelTip: channelTips[input.adChannel],
  };
}
