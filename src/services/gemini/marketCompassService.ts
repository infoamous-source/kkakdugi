import { generateText, isGeminiEnabled } from './geminiClient';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';
import type { MarketScannerResult, EdgeMakerResult, CompetitorInfo } from '../../types/school';
import { safeParseJSON } from './jsonHelper';

// ─── Market Scanner ───

export async function generateMarketAnalysis(
  keyword: string,
  targetAge: string,
  targetGender: string,
  itemType: string = 'other',
  profile?: UserProfileView | null,
): Promise<{ result: MarketScannerResult['output']; isMock: boolean }> {
  if (isGeminiEnabled()) {
    try {
      // buildSystemPrompt 연동: TOPIK 맞춤 시장 분석 코칭
      const systemPrompt = profile
        ? buildSystemPrompt(profile, {
            toolName: '마켓 스캐너',
            toolPurpose: '상품/키워드 기반으로 한국 시장을 분석하고 경쟁사·고객 불만·전략 레포트를 코칭한다.',
            bilingualFeedback: true,
            extraInstructions: [
              '당신은 한국에서 10년 이상 소비재·서비스 시장을 분석해 온 실전 시장 분석가예요.',
              '대기업 신사업팀과 스타트업 투자 심사에서 실제로 쓰이는 수준의 분석을 해요.',
              'relatedKeywords와 painPoints는 한국어만.',
              'analysisReport와 competitors의 strengths/weaknesses만 한국어+영어 병기.',
            ].join(' '),
          })
        : '';

      const userPrompt = `[분석 대상]
상품/키워드: ${keyword}
아이템 형태: ${itemType}
타겟 연령: ${targetAge}
타겟 성별: ${targetGender}

[사고 단계 — JSON에는 포함하지 마세요]
1단계) 시장 규모·트렌드 파악: "${keyword}" 관련 한국 시장이 성장 중인지, 정체인지, 왜 그런지 생각해요.
2단계) 경쟁 구도 분석: 한국에서 실제로 영업 중인 브랜드/서비스 중 이 카테고리의 상위 3곳을 떠올려요. 각각의 진짜 강점과 약점을 분석해요.
3단계) 고객 니즈 발굴: 네이버 쇼핑 리뷰, 블로그 후기, 커뮤니티 글에서 흔히 나오는 불만·니즈를 떠올려요.

다음 JSON 형식으로 정확히 응답하세요 (다른 텍스트 없이 JSON만):
{
  "relatedKeywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "competitors": [
    {
      "name": "경쟁사 이름",
      "description": "한 줄 설명",
      "strengths": ["강점1", "강점2"],
      "weaknesses": ["약점1", "약점2"]
    }
  ],
  "painPoints": ["고객 불만1", "고객 불만2", "고객 불만3"],
  "analysisReport": "**레포트 요약:**\\n1. (핵심 발견 1)\\n2. (핵심 발견 2)\\n3. (핵심 발견 3)\\n4. (핵심 발견 4)\\n5. (핵심 발견 5)\\n\\n(아래에 20줄 상세 전략 레포트를 이어서 작성)"
}

규칙:
- relatedKeywords: 네이버·쿠팡 등에서 실제로 검색량이 높은 연관 키워드 5개. 너무 일반적인 단어("인기 아이템" 등)는 피하고, 이 카테고리에만 해당하는 구체적 키워드로 채워요.
- competitors: 반드시 한국에서 실제로 존재하는 브랜드/서비스 3곳. 가상의 회사("A사", "B사" 등)는 절대 쓰지 마세요. 각각 강점 2개, 약점 2개를 구체적 사실 기반으로 작성해요.
- painPoints: 실제 한국 소비자 리뷰·커뮤니티에서 자주 등장하는 구체적 불만 3개. "~별로예요" 같은 모호한 표현 대신 구체적 상황을 담아 주세요.
- analysisReport: 반드시 아래 형식을 따르세요:
  * 맨 위에 "**레포트 요약:**" (굵은 글씨 마크다운)
  * 바로 아래에 핵심 발견 5가지를 번호 매겨서 정리 (각 1줄)
  * 빈 줄 1개
  * 그 아래에 20줄 상세 분석 레포트 (\\n으로 줄바꿈)
  * 레포트에는 시장 규모·성장 추세, 경쟁사별 포지셔닝 차이, 타겟 고객의 구매 결정 요인, 신규 진입 시 구체적 리스크와 기회를 포함해요
  * 숫자·비율·시기 등 구체적 근거를 넣어서 "교과서 느낌"이 아닌 "실전 보고서" 느낌으로 작성해요
  * 하나의 레포트처럼 자연스럽게 이어지도록 작성
- 아이템 형태(${itemType})에 맞는 시장 분석을 해주세요
- 한국 시장 맥락에 맞는 현실적인 분석`;

      const prompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${userPrompt}` : userPrompt;
      const text = await generateText(prompt);
      if (text) {
        const parsed = safeParseJSON(text);
        if (parsed.relatedKeywords && parsed.competitors && parsed.painPoints) {
          return { result: parsed, isMock: false };
        }
      }
    } catch (err) {
      console.error('[MarketCompass] AI market analysis FAILED, falling back to mock:', err);
    }
  } else {
    console.warn('[MarketCompass] Gemini not enabled. connected=', localStorage.getItem('kkakdugi-gemini-connected'), 'apiKey=', !!localStorage.getItem('kkakdugi-gemini-api-key'));
  }

  return { result: getMockMarketAnalysis(keyword), isMock: true };
}

// ─── Edge Maker ───

export async function generateBrandingStrategy(
  painPoints: string[],
  myStrengths: string[],
  competitors: CompetitorInfo[] = [],
  profile?: UserProfileView | null,
): Promise<{ result: EdgeMakerResult['output']; isMock: boolean }> {
  if (isGeminiEnabled()) {
    try {
      const competitorText = competitors.length > 0
        ? competitors.map((c, i) => `${i + 1}. ${c.name} - ${c.description}\n   강점: ${c.strengths.join(', ')}\n   약점: ${c.weaknesses.join(', ')}`).join('\n')
        : '(경쟁사 정보 없음)';

      // buildSystemPrompt 연동: TOPIK 맞춤 브랜딩 전략
      const systemPrompt = profile
        ? buildSystemPrompt(profile, {
            toolName: '엣지 메이커',
            toolPurpose: '경쟁사 분석과 고객 불만을 기반으로 차별화된 브랜딩 전략을 생성한다.',
            bilingualFeedback: false,
            extraInstructions: [
              '당신은 한국에서 50개 이상의 소비재 브랜드를 론칭한 경험이 있는 실전 브랜딩 전략가예요.',
              '스타트업부터 중견기업까지 다양한 브랜드의 네이밍, 포지셔닝, 비주얼 아이덴티티를 설계해 왔어요.',
              '[중요] brandingReport 필드만 한국어+영어 병기로 작성하라.',
              'usp, brandNames, slogan, brandMood는 한국어만 출력하라.',
            ].join(' '),
          })
        : '';

      const userPrompt = `아래 경쟁사 정보, 고객 불만, 나의 강점을 꼼꼼히 읽고, 차별화된 브랜딩 전략을 만들어주세요.

[경쟁사 정보]
${competitorText}

[고객 불만 (Pain Points)]
${painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

[나의 강점]
${myStrengths.length > 0 ? myStrengths.map((s, i) => `${i + 1}. ${s}`).join('\n') : '(미입력 - 일반적 강점으로 추론)'}

다음 JSON 형식으로 정확히 응답하세요 (다른 텍스트 없이 JSON만):
{
  "usp": "핵심 가치 제안 (1~2문장)",
  "brandNames": [
    { "name": "감성적 브랜드명", "type": "emotional", "reasoning": "이유" },
    { "name": "직관적 브랜드명", "type": "intuitive", "reasoning": "이유" },
    { "name": "재미있는 브랜드명", "type": "fun", "reasoning": "이유" }
  ],
  "slogan": "브랜드 슬로건 (한 줄)",
  "brandMood": {
    "primaryColor": "#HEX코드",
    "secondaryColor": "#HEX코드",
    "tone": "톤 & 매너 설명",
    "keywords": ["키워드1", "키워드2", "키워드3"]
  },
  "brandingReport": "**레포트 요약:**\\n1. (핵심 전략 1)\\n2. (핵심 전략 2)\\n3. (핵심 전략 3)\\n4. (핵심 전략 4)\\n5. (핵심 전략 5)\\n\\n(아래에 20줄 상세 브랜딩 전략 레포트를 이어서 작성)"
}

규칙:
- USP: 경쟁사의 구체적 약점 1~2개를 정면으로 해결하는 차별점을 담은 문장이어야 해요. "최고의 품질" 같은 모호한 표현 대신, "경쟁사 X가 못하는 OO을 우리는 이렇게 해결한다"는 구조로 써 주세요.
- 브랜드명: 한국어, 영어, 또는 한영 혼합 모두 가능해요. 감성형/직관형/재미형 각 1개씩. 실제 상표 등록이 가능할 만한 독창적인 이름으로 만들어 주세요. reasoning에는 왜 이 이름이 타겟 고객에게 먹히는지 구체적으로 설명해요.
- 슬로건: 7단어 이내, 리듬감이 있고 기억에 남는 짧은 문장
- 브랜드 무드:
  * primaryColor와 secondaryColor는 실제 브랜드에서 쓸 수 있는 조화로운 조합이어야 해요. 보색 대비가 너무 강하거나 가독성이 떨어지는 조합은 피해요.
  * primaryColor는 브랜드의 핵심 감성을 전달하는 색, secondaryColor는 이를 보완하는 색으로 골라요.
  * tone은 브랜드가 고객에게 말을 거는 말투와 분위기를 구체적으로 설명해요 (예: "동네 언니가 추천해주는 듯한 편안하고 솔직한")
  * keywords 3개는 브랜드 무드보드에 쓸 수 있는 구체적인 감성 단어로 채워요
- brandingReport는 반드시 아래 형식을 따르세요:
  * 맨 위에 "**레포트 요약:**" (굵은 글씨 마크다운)
  * 바로 아래에 핵심 전략 5가지를 번호 매겨서 정리 (각 1줄)
  * 빈 줄 1개
  * 그 아래에 20줄 상세 브랜딩 전략 레포트 (\\n으로 줄바꿈)
  * 경쟁사들의 포지셔닝 빈틈, 우리 강점이 그 빈틈을 메우는 이유, USP·이름·슬로건·컬러를 정한 근거를 논리적으로 연결해서 설명해요
  * "~이 좋아요" 식의 나열이 아닌, "A이기 때문에 → B 전략을 택했고 → C 결과를 기대한다"는 인과 관계로 써요
  * 하나의 레포트처럼 자연스럽게 이어지도록 작성`;

      const prompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${userPrompt}` : userPrompt;
      const text = await generateText(prompt);
      if (text) {
        const parsed = safeParseJSON(text);
        if (parsed.usp && parsed.brandNames && parsed.slogan && parsed.brandMood) {
          return { result: parsed, isMock: false };
        }
      }
    } catch (err) {
      console.error('[MarketCompass] AI branding FAILED, falling back to mock:', err);
    }
  } else {
    console.warn('[MarketCompass] Gemini not enabled for branding.');
  }

  return { result: getMockBrandingStrategy(painPoints), isMock: true };
}

// ─── Mock 데이터 ───

function getMockMarketAnalysis(keyword: string): MarketScannerResult['output'] {
  const lower = keyword.toLowerCase();

  // 카테고리별 Mock 데이터
  if (lower.includes('만두') || lower.includes('음식') || lower.includes('식품') || lower.includes('비건')) {
    return {
      relatedKeywords: ['건강식', '다이어트 식품', '비건 간식', '냉동식품', '한끼 대용'],
      competitors: [
        {
          name: '비비고',
          description: '한국 대표 냉동 만두 브랜드',
          strengths: ['높은 브랜드 인지도', '전국 유통망'],
          weaknesses: ['비건 라인업 부족', '프리미엄 가격대'],
        },
        {
          name: '풀무원',
          description: '건강식 전문 식품 기업',
          strengths: ['건강한 이미지', '다양한 제품 라인업'],
          weaknesses: ['맛에 대한 불만 많음', '가격 대비 양 부족'],
        },
        {
          name: '마켓컬리 PB',
          description: '프리미엄 식품 PB 브랜드',
          strengths: ['새벽배송 서비스', '트렌디한 이미지'],
          weaknesses: ['접근성 낮음', '재구매율 불안정'],
        },
      ],
      painPoints: [
        '맛이 밍밍하고 식감이 별로예요',
        '가격이 너무 비싸서 자주 못 사요',
        '성분표를 보면 첨가물이 많아 걱정돼요',
      ],
      analysisReport: '**레포트 요약:**\n1. 건강식·비건 시장이 빠르게 성장하고 있어요\n2. 비비고·풀무원 등 대기업이 있지만 비건 제품은 부족해요\n3. 고객들은 맛있고 건강한 제품을 합리적 가격에 원해요\n4. 무첨가·비건 식품은 아직 선택지가 적어 기회가 있어요\n5. SNS 마케팅과 온라인 판매가 핵심 채널이에요\n\n이 시장은 건강한 음식을 찾는 사람들이 많아요.\n특히 비건이나 다이어트 식품에 관심이 커지고 있어요.\n"건강식", "다이어트 식품" 같은 키워드가 인기가 많아요.\n비비고가 가장 유명한 브랜드인데, 비건 제품은 별로 없어요.\n풀무원은 건강한 이미지가 있지만 맛이 아쉽다는 의견이 많아요.\n마켓컬리는 새벽배송이 좋지만 가격이 비싸요.\n고객들은 "맛있으면서 건강한 제품"을 원해요.\n가격도 너무 비싸지 않았으면 좋겠다고 해요.\n첨가물이 적은 깨끗한 제품을 찾고 있어요.\n이 시장에 들어가려면 맛과 건강 두 가지를 다 잡아야 해요.\n가격을 합리적으로 맞추면 경쟁력이 있어요.\n비건이나 무첨가 제품은 아직 선택이 적어요.\n그래서 이 부분을 공략하면 좋은 기회가 될 수 있어요.\n온라인 판매와 배달 서비스도 중요해요.\nSNS에서 건강식 후기가 많이 공유되고 있어요.\n인스타그램이나 유튜브 마케팅이 효과적일 수 있어요.\n처음에는 소량 생산으로 시작해서 반응을 보는 게 좋아요.\n고객 후기를 잘 모아서 신뢰를 쌓는 게 중요해요.\n맛 테스트나 시식 이벤트를 하면 도움이 돼요.\n이 시장은 성장하고 있어서 지금 시작하면 좋은 타이밍이에요.',
    };
  }

  if (lower.includes('화장품') || lower.includes('뷰티') || lower.includes('스킨') || lower.includes('비누')) {
    return {
      relatedKeywords: ['자연주의 화장품', '비건 뷰티', '민감 피부', '수제 비누', '클린 뷰티'],
      competitors: [
        {
          name: '이니스프리',
          description: '자연주의 화장품 브랜드',
          strengths: ['자연 원료 이미지', '합리적 가격'],
          weaknesses: ['차별화 약화', '해외 브랜드에 밀림'],
        },
        {
          name: '아로마티카',
          description: '비건 뷰티 전문 브랜드',
          strengths: ['비건 인증', '친환경 패키지'],
          weaknesses: ['높은 가격대', '오프라인 매장 부족'],
        },
        {
          name: '올리브영 PB',
          description: '올리브영 자체 브랜드',
          strengths: ['접근성 좋음', '트렌드 반영 빠름'],
          weaknesses: ['브랜드 정체성 약함', '품질 편차 있음'],
        },
      ],
      painPoints: [
        '피부가 예민한데 자극이 심해요',
        '천연 성분이라고 했는데 화학 성분이 많아요',
        '향이 너무 강해서 두통이 와요',
      ],
      analysisReport: '**레포트 요약:**\n1. 클린 뷰티·비건 뷰티 시장이 빠르게 성장 중이에요\n2. 민감 피부 고객이 자극 없는 순한 제품을 원해요\n3. 이니스프리·아로마티카 등 경쟁자는 있지만 빈틈이 있어요\n4. 비건 인증 + 합리적 가격이면 차별화할 수 있어요\n5. 인스타그램 뷰티 후기와 체험 키트가 핵심 마케팅이에요\n\n뷰티 시장에서 자연주의와 비건 제품이 인기가 많아요.\n"클린 뷰티"라는 말을 많이 쓰는데, 깨끗한 성분의 화장품이라는 뜻이에요.\n민감한 피부를 가진 사람들이 자극 없는 제품을 많이 찾아요.\n이니스프리가 유명하지만 요즘은 다른 브랜드에 밀리고 있어요.\n아로마티카는 비건 인증이 있어서 인기가 많지만 가격이 비싸요.\n올리브영 PB는 사기 쉽지만 브랜드 특별함이 부족해요.\n고객들은 "진짜 자연 성분"인 제품을 원해요.\n향이 너무 세지 않은 제품이 좋다고 해요.\n피부에 자극이 없는 순한 제품을 찾고 있어요.\n이 시장에 들어가려면 성분에 대한 신뢰가 가장 중요해요.\n비건 인증이나 무향 제품은 차별화가 될 수 있어요.\n가격이 합리적이면서 품질이 좋은 제품이 필요해요.\n수제 비누나 핸드메이드 제품은 특별한 느낌을 줄 수 있어요.\n인스타그램에서 뷰티 후기를 많이 보기 때문에 사진이 중요해요.\n체험 키트나 샘플 세트로 먼저 고객을 모으면 좋아요.\n성분 목록을 쉽게 보여주면 고객이 안심해요.\n환경을 생각하는 패키지도 좋은 인상을 줘요.\n처음에는 한두 가지 제품에 집중하는 게 좋아요.\n고객 후기와 사용 전후 사진이 마케팅에 도움이 돼요.\n이 시장은 계속 커지고 있어서 기회가 많아요.',
    };
  }

  // 기본 범용 데이터
  return {
    relatedKeywords: ['트렌드 상품', '인기 아이템', '가성비', 'MZ세대', '온라인 쇼핑'],
    competitors: [
      {
        name: '업계 선두 A사',
        description: '시장 점유율 1위 기업',
        strengths: ['높은 인지도', '안정적인 품질'],
        weaknesses: ['혁신 부족', '고객 소통 부족'],
      },
      {
        name: '신흥 강자 B사',
        description: 'SNS 마케팅으로 급성장한 브랜드',
        strengths: ['트렌디한 이미지', '활발한 SNS 마케팅'],
        weaknesses: ['품질 불안정', '고객 서비스 미흡'],
      },
      {
        name: '가성비 C사',
        description: '저가 전략으로 시장 공략',
        strengths: ['저렴한 가격', '빠른 배송'],
        weaknesses: ['낮은 품질 인식', '브랜드 충성도 낮음'],
      },
    ],
    painPoints: [
      '품질 대비 가격이 너무 비싸요',
      '고객 응대가 느리고 불친절해요',
      '제품 설명과 실물이 달라요',
    ],
    analysisReport: '**레포트 요약:**\n1. 여러 경쟁사가 있지만 각각 약점이 뚜렷해요\n2. 고객은 좋은 품질 + 합리적 가격 + 빠른 배송을 원해요\n3. SNS 마케팅(인스타·틱톡)이 가장 효과적인 채널이에요\n4. 차별화 포인트를 명확히 잡으면 경쟁력이 있어요\n5. 온라인 판매로 시작해서 고객 후기를 모으는 게 핵심이에요\n\n이 시장에는 여러 회사가 경쟁하고 있어요.\n"트렌드 상품"이나 "가성비" 같은 키워드가 인기가 많아요.\nA사가 가장 유명하지만 새로운 시도가 부족해요.\nB사는 SNS 마케팅을 잘 하지만 품질이 고르지 않아요.\nC사는 가격이 싸지만 브랜드 이미지가 약해요.\n고객들은 좋은 품질을 합리적인 가격에 원해요.\n빠르고 친절한 고객 서비스도 중요하게 생각해요.\n제품 사진과 실물이 같았으면 좋겠다고 해요.\n이 시장에 들어가려면 품질과 가격의 균형이 중요해요.\nSNS에서 제품을 알리는 게 효과적이에요.\n인스타그램이나 틱톡에서 짧은 영상이 인기가 많아요.\n고객 후기를 잘 관리하면 신뢰가 올라가요.\n배송이 빠르면 고객 만족도가 높아져요.\n처음에는 한 가지 제품에 집중하는 게 좋아요.\n다른 회사와 다른 특별한 점을 만들어야 해요.\n고객과 직접 소통하면 팬이 될 수 있어요.\n이벤트나 할인으로 처음 고객을 모을 수 있어요.\n온라인 판매를 먼저 시작하면 비용을 줄일 수 있어요.\n고객의 의견을 듣고 제품을 개선하는 게 중요해요.\n이 시장은 변화가 빠르기 때문에 빠르게 움직여야 해요.',
  };
}

function getMockBrandingStrategy(painPoints: string[]): EdgeMakerResult['output'] {
  return {
    usp: painPoints.length > 0
      ? `고객이 불만족한 "${painPoints[0]}" 문제를 완벽히 해결하는 유일한 브랜드`
      : '고객의 숨겨진 니즈를 발견하고 최고의 경험을 제공하는 브랜드',
    brandNames: [
      {
        name: '따스한하루',
        type: 'emotional',
        reasoning: '따뜻하고 정성스러운 느낌을 전달하여 고객의 마음을 사로잡는 이름',
      },
      {
        name: '진심담아',
        type: 'intuitive',
        reasoning: '진심을 담은 제품이라는 브랜드 철학을 직관적으로 전달',
      },
      {
        name: '헬로굿즈',
        type: 'fun',
        reasoning: '친근하고 기분 좋은 첫인상을 주는 밝은 느낌의 이름',
      },
    ],
    slogan: '당신의 일상에 작은 행복을 더합니다',
    brandMood: {
      primaryColor: '#FF6B35',
      secondaryColor: '#4ECDC4',
      tone: '밝고 따뜻하며 친근한',
      keywords: ['따뜻함', '신뢰', '신선함'],
    },
    brandingReport: '**레포트 요약:**\n1. 경쟁사들은 각각 혁신 부족·품질 불안·차별화 약화의 약점이 있어요\n2. 고객은 좋은 품질 + 따뜻한 브랜드 느낌을 원해요\n3. "따스한하루" 감성형 이름이 타겟에 가장 잘 맞아요\n4. 주황색+민트색 컬러 조합으로 밝고 친근한 이미지를 만들어요\n5. 고객 불만을 정면으로 해결하는 USP가 핵심 차별점이에요\n\n경쟁사들을 살펴봤어요.\n첫 번째 회사는 유명하지만 새로운 시도가 부족해요.\n두 번째 회사는 SNS를 잘 하지만 품질이 고르지 않아요.\n세 번째 회사는 가격이 싸지만 특별한 느낌이 없어요.\n그래서 우리는 이 점을 잘 이용할 수 있어요.\n고객들이 원하는 것은 좋은 품질과 따뜻한 느낌이에요.\n우리의 강점은 정성을 담은 제품을 만들 수 있다는 거예요.\nUSP를 "고객의 불만을 해결하는 브랜드"로 정한 이유가 있어요.\n경쟁사가 못하는 부분을 우리가 잘 할 수 있기 때문이에요.\n브랜드 이름 "따스한하루"는 따뜻한 느낌을 주고 싶어서 만들었어요.\n"진심담아"는 우리 제품에 진심이 담겨있다는 뜻이에요.\n"헬로굿즈"는 밝고 친근한 느낌으로 젊은 고객에게 좋아요.\n슬로건 "일상에 작은 행복을 더합니다"는 기억하기 쉬워요.\n브랜드 컬러로 주황색을 골랐어요. 따뜻하고 활기찬 느낌이에요.\n보조 컬러는 민트색이에요. 깨끗하고 신선한 느낌을 줘요.\n이 두 색깔이 함께 있으면 밝고 친근한 느낌이 돼요.\n톤은 "밝고 따뜻하며 친근한" 스타일로 정했어요.\n고객이 우리 브랜드를 보면 편안함을 느끼도록 하고 싶어요.\n이런 브랜딩으로 경쟁사와 다른 특별한 이미지를 만들 수 있어요.\n고객이 한 번 오면 다시 오고 싶은 브랜드가 될 수 있어요.',
  };
}
