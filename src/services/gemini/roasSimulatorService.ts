import { generateText, isGeminiEnabled } from './geminiClient';
import { safeParseJSON } from './jsonHelper';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';
import type { ROASInput, ROASOutput, ROASStatus, ROASChannel } from '../../types/school';

// ─── 채널 한국어 라벨 ───

const CHANNEL_NAMES: Record<ROASChannel, string> = {
  instagram: '인스타그램',
  naver: '네이버',
  kakao: '카카오톡',
  youtube: '유튜브',
};

// ─── 클라이언트 사이드 ROAS 계산 (mockup 확정안) ───
// AI 호출 없이 수식으로 즉시 계산. 30명 동시 부하 안전.

export function calculateRoas(adSpend: number, revenue: number): {
  roas: number;
  profit: number;
  status: ROASStatus;
} {
  const roas = adSpend > 0 ? Number((revenue / adSpend).toFixed(1)) : 0;
  const profit = revenue - adSpend;
  let status: ROASStatus;
  if (roas < 1.5) status = 'loss';
  else if (roas <= 2.5) status = 'breakeven';
  else status = 'profit';
  return { roas, profit, status };
}

// ─── ROAS 자가 진단 (가벼운 AI 호출) ───
// 큰 한 줄 처방 + 오늘 할 일 1개만 받아옴

export async function getRoasPrescription(
  input: ROASInput,
  profile?: UserProfileView | null,
): Promise<{ output: ROASOutput; isMock: boolean }> {
  const { roas, profit, status } = calculateRoas(input.adSpend, input.revenue);

  if (isGeminiEnabled()) {
    try {
      const statusKo = status === 'loss' ? '손해' : status === 'breakeven' ? '본전' : '좋아요';
      const direction =
        status === 'loss'
          ? '광고비를 줄이거나 광고 소재를 완전히 바꾸는'
          : status === 'breakeven'
            ? '같은 예산에서 광고 소재·문구를 개선하는'
            : '잘 되는 광고에 예산을 더 키우는';

      // buildSystemPrompt 연동: TOPIK 맞춤 + 한국어+영어 병기 코칭
      const systemPrompt = profile
        ? buildSystemPrompt(profile, {
            toolName: 'ROAS 진단기',
            toolPurpose: '광고 효율(ROAS)을 진단하고 개선 처방을 코칭한다.',
            bilingualFeedback: true,
            extraInstructions: [
              '당신은 한국 퍼포먼스 마케팅 10년차 전문가예요.',
              'prescription 방향: ' + direction + ' 쪽으로.',
              'prescription 두 번째 줄에 실제 숫자를 활용한 구체적 변경 포함.',
              'todoOne은 광고 사진/문구/타겟/시간대 중 1개에 대한 즉시 실행 가능한 행동.',
              '어려운 마케팅 용어 금지 (CTR, CPC, 리타겟팅 X). 쉬운 말로 대체.',
            ].join(' '),
          })
        : '';

      const userPrompt = `## 입력 데이터
- 광고비: ${input.adSpend.toLocaleString()}원
- 매출: ${input.revenue.toLocaleString()}원
- ROAS: ${roas} (${statusKo})
- 광고 채널: ${CHANNEL_NAMES[input.adChannel]}

## 응답 형식 (JSON만, 다른 텍스트 X)
{
  "prescription": "큰 한 줄 처방. 형식: '동사 명령형\\n구체적 액션'. 줄바꿈 \\n 1개 사용. 예: '광고비를 줄이세요 (Reduce ad spend)\\n30만원 → 20만원으로'",
  "todoOne": "오늘 할 일 1개. 짧고 구체적인 행동. 예: '광고 사진을 새 걸로 바꿔보세요 (Try changing the ad photo)'"
}`;

      const prompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${userPrompt}` : userPrompt;
      const text = await generateText(prompt);
      if (text) {
        const parsed = safeParseJSON(text);
        if (parsed?.prescription && parsed?.todoOne) {
          return {
            output: {
              roas,
              profit,
              status,
              prescription: String(parsed.prescription),
              todoOne: String(parsed.todoOne),
            },
            isMock: false,
          };
        }
      }
    } catch (err) {
      console.error('[ROASSimulator] AI prescription FAILED, falling back to mock:', err);
    }
  }

  return { output: getMockOutput(input, roas, profit, status), isMock: true };
}

// ─── Mock fallback ───

function getMockOutput(
  input: ROASInput,
  roas: number,
  profit: number,
  status: ROASStatus,
): ROASOutput {
  const spendMan = Math.round(input.adSpend / 10000);

  const lossPool = [
    {
      prescription: `광고비를 줄이세요\n${spendMan}만원 → ${Math.max(1, Math.round(spendMan * 0.7))}만원으로`,
      todoOne: '광고 사진을 새 걸로 바꿔보세요',
    },
    {
      prescription: `타겟을 더 좁혀보세요\n관심사 1~2개로 집중`,
      todoOne: '광고 문구의 첫 줄을 다시 써보세요',
    },
  ];
  const breakevenPool = [
    {
      prescription: `광고 사진을 바꿔보세요\n눈에 띄는 색으로`,
      todoOne: '광고 사진을 새 걸로 바꿔보세요',
    },
    {
      prescription: `광고 문구를 더 짧게\n핵심만 한 줄로`,
      todoOne: '광고 문구의 첫 줄을 다시 써보세요',
    },
  ];
  const profitPool = [
    {
      prescription: `광고비를 늘려보세요\n${spendMan}만원 → ${Math.round(spendMan * 1.5)}만원으로`,
      todoOne: '잘 되는 광고에 예산을 더 넣어보세요',
    },
    {
      prescription: `같은 광고를 더 오래 돌려보세요\n7일 더 연장`,
      todoOne: '광고 시간대를 저녁으로 바꿔보세요',
    },
  ];

  const pool = status === 'loss' ? lossPool : status === 'breakeven' ? breakevenPool : profitPool;
  const pick = pool[Math.floor(Math.random() * pool.length)];

  return {
    roas,
    profit,
    status,
    prescription: pick.prescription,
    todoOne: pick.todoOne,
  };
}
