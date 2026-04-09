/**
 * 한국 체류 기간별 내러티브 전략
 *
 * 같은 사용자가 같은 강점을 가져도 체류 기간에 따라
 * 자소서의 모국/한국 경험 비중과 내러티브 톤이 완전히 달라진다.
 *
 * - 6개월 미만: 한국 경험 거의 없음 → 모국 경험 + "한국에 대한 기대"
 * - 5년 이상: 한국 경험이 주축 → 모국 경험은 배경
 *
 * STAR 인터뷰 질문 필터링에도 사용된다.
 * 6개월 차에게 "한국에서 ~한 적 있어요?" 류 질문을 던지면 막히기 때문.
 */

import type { YearsInKorea } from '../../types/database';

export interface YearsStrategy {
  code: YearsInKorea;
  label: string;
  labelEn: string;
  /** 모국 경험 비중 (0~1) */
  homeCountryWeight: number;
  /** 한국 경험 비중 (0~1) */
  koreaWeight: number;
  /** 자소서 내러티브 포커스 한 줄 */
  narrativeFocus: string;
  /** STAR 질문 필터 */
  starQuestionFilter: {
    /** 한국에서의 경험 질문을 허용할지 */
    allowKoreaSpecific: boolean;
    /** 모국 경험 질문에 가중치 줄지 */
    emphasizeHomeCountry: boolean;
    /** 적응 스토리 질문을 포함할지 */
    includeAdaptationStory: boolean;
  };
  /** AI 프롬프트 주입 지시문 */
  aiInstruction: string;
}

const YEARS_STRATEGIES: Record<YearsInKorea, YearsStrategy> = {
  under6m: {
    code: 'under6m',
    label: '6개월 미만',
    labelEn: 'Less than 6 months',
    homeCountryWeight: 0.85,
    koreaWeight: 0.15,
    narrativeFocus: '한국에 대한 기대와 의지, 모국에서 쌓은 강점',
    starQuestionFilter: {
      allowKoreaSpecific: false,
      emphasizeHomeCountry: true,
      includeAdaptationStory: true,
    },
    aiInstruction: [
      '사용자는 한국에 온 지 6개월이 채 되지 않았다.',
      '자소서는 모국에서 쌓은 경험·학업·강점을 주축으로 작성하라 (약 80~85%).',
      '한국에서의 경험은 "현재 노력 중인 것"이나 "첫 인상" 수준으로만 짧게 언급하라.',
      '과장된 "한국 전문성"이나 "장기 적응 경험" 표현은 절대 사용하지 말라.',
      '내러티브 포커스: 한국에 대한 기대와 의지, 배우고 싶은 열정.',
      '5년 후의 나 같은 거창한 장기 비전보다는 "한국어와 일을 동시에 배우겠다" 같은 현실적 톤을 사용하라.',
    ].join(' '),
  },
  '6m_1y': {
    code: '6m_1y',
    label: '6개월 ~ 1년',
    labelEn: '6 months ~ 1 year',
    homeCountryWeight: 0.7,
    koreaWeight: 0.3,
    narrativeFocus: '초기 적응 경험과 모국 자산의 결합',
    starQuestionFilter: {
      allowKoreaSpecific: true,
      emphasizeHomeCountry: true,
      includeAdaptationStory: true,
    },
    aiInstruction: [
      '사용자는 한국에 온 지 6개월~1년 차다.',
      '자소서는 모국 경험(약 70%) + 한국 초기 적응 경험(약 30%)의 조합으로 작성하라.',
      '한국어학당, 첫 알바, 첫 한국인 친구, 첫 행정 업무 같은 초기 적응 경험을 자연스럽게 녹여라.',
      '아직 한국 전문가 톤은 피하고, 열정적 학습자 톤을 유지하라.',
      '내러티브 포커스: 빠른 적응력과 모국 강점의 결합.',
    ].join(' '),
  },
  '1y_3y': {
    code: '1y_3y',
    label: '1년 ~ 3년',
    labelEn: '1 ~ 3 years',
    homeCountryWeight: 0.45,
    koreaWeight: 0.55,
    narrativeFocus: '한국 생활 기반 다지기와 다양한 경험 축적',
    starQuestionFilter: {
      allowKoreaSpecific: true,
      emphasizeHomeCountry: false,
      includeAdaptationStory: true,
    },
    aiInstruction: [
      '사용자는 한국 체류 1~3년 차다.',
      '자소서는 한국 경험(약 55%)과 모국 경험(약 45%)을 균형 있게 다루라.',
      '한국에서의 알바, 학업, 한국어 공부, 사회 경험을 구체 사례로 활용하라.',
      '이 시기는 한국 적응 스토리가 가장 풍부한 시기이므로 킬러 콘텐츠로 활용 가능하다.',
      '내러티브 포커스: 한국 생활 기반 다지기, 다양한 경험 축적, 꾸준한 성장.',
    ].join(' '),
  },
  '3y_5y': {
    code: '3y_5y',
    label: '3년 ~ 5년',
    labelEn: '3 ~ 5 years',
    homeCountryWeight: 0.3,
    koreaWeight: 0.7,
    narrativeFocus: '한국 사회 일원으로서의 경험과 전문성',
    starQuestionFilter: {
      allowKoreaSpecific: true,
      emphasizeHomeCountry: false,
      includeAdaptationStory: false,
    },
    aiInstruction: [
      '사용자는 한국 체류 3~5년 차다.',
      '자소서는 한국에서의 경험(약 70%)을 주축으로 작성하고, 모국 경험은 배경(약 30%)으로 축소하라.',
      '한국 직장·학업·사회 경험에서 구체 사례를 다수 발굴하라.',
      '"한국 적응 중"보다 "한국 사회 일원"으로서의 관점으로 서술하라.',
      '내러티브 포커스: 한국 사회에서의 성장과 전문성 형성.',
    ].join(' '),
  },
  '5y_10y': {
    code: '5y_10y',
    label: '5년 ~ 10년',
    labelEn: '5 ~ 10 years',
    homeCountryWeight: 0.15,
    koreaWeight: 0.85,
    narrativeFocus: '한국에서의 전문성과 장기 기여',
    starQuestionFilter: {
      allowKoreaSpecific: true,
      emphasizeHomeCountry: false,
      includeAdaptationStory: false,
    },
    aiInstruction: [
      '사용자는 한국 체류 5~10년 차다.',
      '자소서는 한국에서의 직장·학업·사회 경험(약 85%)을 중심으로 작성하라.',
      '모국 경험은 "원래 잘하는 것의 뿌리" 수준으로만 짧게 언급하라.',
      '한국에서 쌓은 전문성·관계·성과를 구체 수치로 강조하라.',
      '"외국인" 정체성보다는 "한국에서 오래 일한 사람" 정체성을 기본으로 하라.',
      '내러티브 포커스: 한국에서의 전문성과 장기 기여.',
    ].join(' '),
  },
  over10y: {
    code: 'over10y',
    label: '10년 이상',
    labelEn: 'Over 10 years',
    homeCountryWeight: 0.1,
    koreaWeight: 0.9,
    narrativeFocus: '한국에 뿌리내린 정착과 장기 기여',
    starQuestionFilter: {
      allowKoreaSpecific: true,
      emphasizeHomeCountry: false,
      includeAdaptationStory: false,
    },
    aiInstruction: [
      '사용자는 한국 체류 10년 이상의 장기 거주자다.',
      '자소서는 한국 경험(약 90%)을 중심으로 작성하며, 모국 배경은 간단한 소개 수준으로만 언급하라.',
      '한국인과 거의 동등한 수준의 관점과 톤을 사용하라.',
      '장기 거주로 인한 깊은 한국 사회 이해와 안정적 기여 의지를 강조하라.',
      '내러티브 포커스: 한국 사회의 일원으로서의 정착과 장기 기여.',
    ].join(' '),
  },
};

/** 체류 기간에 맞는 전략 조회. null이면 1~3년 기본값 반환. */
export function getYearsStrategy(years: YearsInKorea | null | undefined): YearsStrategy {
  if (!years) return YEARS_STRATEGIES['1y_3y'];
  return YEARS_STRATEGIES[years] ?? YEARS_STRATEGIES['1y_3y'];
}
