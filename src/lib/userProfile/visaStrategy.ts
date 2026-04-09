/**
 * 비자별 자소서·이력서·면접 전략 매핑
 *
 * 비자 종류에 따라 사용자의 한국 정체성·법적 상태·직장 선택 폭이 달라진다.
 * 같은 사람이 같은 경험을 갖고 있어도 비자별로 자소서 톤·강조점이 완전히 다르다.
 *
 * E-9(비전문 취업)와 E-7(전문직)의 자소서는 톤 자체가 다르며,
 * F-6(결혼이민)과 D-2(유학)는 어필 포인트가 완전히 다르다.
 *
 * 이 모듈은 모든 커리어 관련 AI 도구가 공통으로 참조한다.
 */

import type { VisaType } from '../../types/database';

export type VisaCategory =
  | 'professional'   // 전문직 (E-7)
  | 'general_work'   // 일반 근로 (E-9, H-2)
  | 'student'        // 학생 (D-2, D-4)
  | 'residence'      // 거주/영주 (F-2, F-5)
  | 'kinship'        // 동포/결혼 (F-4, F-6)
  | 'unknown';       // 기타/모름

export type ResumeTone =
  | 'expertise'      // 전문성·성장·성과 중심
  | 'diligence'      // 성실·체력·책임감 중심
  | 'potential'      // 학습·잠재력·도전 중심
  | 'settlement'     // 안정·정착·기여 중심
  | 'adaptation'     // 적응·관계·배움 중심
  | 'neutral';       // 일반 톤

export interface VisaStrategy {
  code: VisaType;
  label: string;
  labelEn: string;
  category: VisaCategory;
  resumeTone: ResumeTone;
  /** 자소서·이력서에서 강조할 포인트 */
  emphasisPoints: string[];
  /** 피해야 할 주제 (비자 정체성에 어긋나거나 오해 소지) */
  avoidTopics: string[];
  /** 법적 주의사항 (가능 직종 제한 등) */
  legalNotes: string[];
  /** AI 프롬프트에 주입할 지시문 */
  aiInstruction: string;
}

const VISA_STRATEGIES: Record<VisaType, VisaStrategy> = {
  E7: {
    code: 'E7',
    label: 'E-7 전문직',
    labelEn: 'E-7 Professional',
    category: 'professional',
    resumeTone: 'expertise',
    emphasisPoints: [
      '모국에서의 학위·전공·전문 경력',
      '한국어 학습 의지와 글로벌 감각',
      '기술/산업 전문성과 성장 계획',
      '국제 업무 경험이나 다문화 협업 능력',
    ],
    avoidTopics: ['단순 노동 지향', '장기 거주 자체를 목표로 하는 표현'],
    legalNotes: ['E-7은 지정 전문 직종에서만 취업 가능', '학위·경력 요건 충족 필요'],
    aiInstruction: [
      '사용자는 E-7 전문직 비자 보유자다.',
      '자소서는 전문성·성장·성과 중심으로 작성하라.',
      '모국에서의 학위와 전문 경력을 핵심 자산으로 활용하라.',
      '글로벌 감각·다문화 협업·한국어 학습 의지를 강조하라.',
      '단순 노동이나 장기 거주만을 목표로 하는 표현은 피하라.',
    ].join(' '),
  },
  E9: {
    code: 'E9',
    label: 'E-9 일반 취업',
    labelEn: 'E-9 Non-professional',
    category: 'general_work',
    resumeTone: 'diligence',
    emphasisPoints: [
      '성실함과 책임감',
      '장기 근속 의지',
      '체력과 안전수칙 준수',
      '한국 직장 문화 이해와 협업',
      '꾸준한 한국어 학습',
    ],
    avoidTopics: ['전문직 이직 언급', '불법 체류 관련 표현'],
    legalNotes: ['E-9은 지정 업종(제조/건설/농축수산/서비스)만 가능', '사업장 변경 제한'],
    aiInstruction: [
      '사용자는 E-9 비전문 취업 비자 보유자다.',
      '자소서는 성실·책임감·장기 근속 의지를 중심으로 작성하라.',
      '과장된 전문성이나 학술적 표현은 피하고, 솔직하고 담백한 문체를 사용하라.',
      '한국 직장 문화에 잘 적응하고 협업할 수 있음을 보여라.',
      '안전수칙 준수와 꾸준한 한국어 학습 의지를 강조하라.',
    ].join(' '),
  },
  H2: {
    code: 'H2',
    label: 'H-2 방문취업',
    labelEn: 'H-2 Working Visit',
    category: 'general_work',
    resumeTone: 'diligence',
    emphasisPoints: [
      '한국 문화·언어에 대한 친숙함',
      '성실한 근로 의지',
      '동포로서의 한국 정체성',
      '가족·뿌리와의 연결',
    ],
    avoidTopics: ['정치적 논쟁', '민감한 역사 언급'],
    legalNotes: ['H-2는 재외동포(주로 중국·CIS) 대상', '지정 업종 내 취업 가능'],
    aiInstruction: [
      '사용자는 H-2 방문취업 비자 보유자(주로 재외동포)다.',
      '자소서는 성실함과 한국 문화에 대한 친숙함을 강조하라.',
      '동포로서의 한국 정체성과 근로 의지를 자연스럽게 담아라.',
      '정치적·역사적 민감 주제는 피하라.',
    ].join(' '),
  },
  F2: {
    code: 'F2',
    label: 'F-2 거주',
    labelEn: 'F-2 Residence',
    category: 'residence',
    resumeTone: 'settlement',
    emphasisPoints: [
      '안정적인 정착과 기여',
      '한국 사회에 대한 이해',
      '장기 거주 계획',
      '다양한 직종에 대한 개방성',
    ],
    avoidTopics: ['단기 체류 계획'],
    legalNotes: ['F-2는 취업 제한이 적음', '점수제 비자이므로 연장 요건 유의'],
    aiInstruction: [
      '사용자는 F-2 거주 비자 보유자다.',
      '자소서는 안정적 정착과 한국 사회 기여를 중심으로 작성하라.',
      '장기 거주 계획과 한국 사회에 대한 깊은 이해를 강조하라.',
      '다양한 직종에 적응할 수 있는 유연성을 어필하라.',
    ].join(' '),
  },
  F4: {
    code: 'F4',
    label: 'F-4 재외동포',
    labelEn: 'F-4 Overseas Korean',
    category: 'kinship',
    resumeTone: 'settlement',
    emphasisPoints: [
      '한국 정체성과 뿌리',
      '가족 배경과 문화 연결',
      '한국어·한국 문화 친숙함',
      '장기적 기여 의지',
    ],
    avoidTopics: ['민감한 정치·역사 논쟁'],
    legalNotes: ['F-4는 단순 노무직 제외하고 대부분 직종 가능'],
    aiInstruction: [
      '사용자는 F-4 재외동포 비자 보유자다.',
      '자소서는 한국 정체성과 장기적 기여 의지를 중심으로 작성하라.',
      '가족적·문화적 뿌리를 자연스럽게 녹여라.',
      '민감한 정치·역사 주제는 피하라.',
    ].join(' '),
  },
  F5: {
    code: 'F5',
    label: 'F-5 영주',
    labelEn: 'F-5 Permanent',
    category: 'residence',
    resumeTone: 'settlement',
    emphasisPoints: [
      '한국 사회의 일원으로서의 정체성',
      '장기 근속과 조직 기여',
      '안정성과 책임감',
      '한국에 대한 깊은 이해',
    ],
    avoidTopics: ['출국·이민 계획'],
    legalNotes: ['F-5는 취업 제한 거의 없음, 참정권 일부 있음'],
    aiInstruction: [
      '사용자는 F-5 영주권자다.',
      '자소서는 한국 사회의 일원이라는 정체성과 장기 근속 의지를 강조하라.',
      '안정성과 책임감, 한국에 대한 깊은 이해를 녹여라.',
      '외국인보다는 정착한 한국 거주자 관점에서 작성하라.',
    ].join(' '),
  },
  F6: {
    code: 'F6',
    label: 'F-6 결혼이민',
    labelEn: 'F-6 Marriage',
    category: 'kinship',
    resumeTone: 'adaptation',
    emphasisPoints: [
      '한국 가족과 지역사회 적응',
      '육아·가정과 병행 가능한 성실함',
      '다문화 자녀 교육 경험 (해당 시)',
      '한국 문화에 대한 이해와 기여',
      '관계 중심의 협업 능력',
    ],
    avoidTopics: ['결혼 자체에 대한 상세 언급', '개인 가족사 공개'],
    legalNotes: ['F-6은 취업 제한 거의 없음', '배우자 자격 유지 필요'],
    aiInstruction: [
      '사용자는 F-6 결혼이민자다.',
      '자소서는 한국 가족·지역사회 적응과 관계 중심 능력을 강조하라.',
      '가정과 일을 병행할 수 있는 성실함과 책임감을 담아라.',
      '한국 문화에 대한 깊은 이해와 기여 의지를 녹여라.',
      '결혼 자체나 개인 가족사는 자세히 다루지 말고, 자산으로서의 경험만 언급하라.',
    ].join(' '),
  },
  D2: {
    code: 'D2',
    label: 'D-2 유학',
    labelEn: 'D-2 Study',
    category: 'student',
    resumeTone: 'potential',
    emphasisPoints: [
      '학업 성과와 전공 역량',
      '학습 능력과 빠른 적응',
      '동아리·팀 프로젝트 경험',
      '인턴·알바 경험',
      '장학금이나 학업 표창',
      '장기 커리어 비전',
    ],
    avoidTopics: ['학업 외면', '불성실한 학교 생활'],
    legalNotes: ['D-2는 주당 제한된 시간 내 알바 가능', '학업이 주 목적'],
    aiInstruction: [
      '사용자는 D-2 유학 비자 보유자다.',
      '자소서는 학업 성과·전공 역량·학습 능력을 중심으로 작성하라.',
      '동아리, 팀 프로젝트, 인턴, 알바 경험을 구체적인 사례로 활용하라.',
      '신입으로서의 잠재력과 도전 의식을 강조하되, 과장은 금물이다.',
      '졸업 후 장기 커리어 비전을 자연스럽게 녹여라.',
    ].join(' '),
  },
  D4: {
    code: 'D4',
    label: 'D-4 어학연수',
    labelEn: 'D-4 Language Study',
    category: 'student',
    resumeTone: 'potential',
    emphasisPoints: [
      '한국어 학습 의지와 성장',
      '문화 적응력',
      '장기 학업·커리어 계획',
      '꾸준함과 성실함',
    ],
    avoidTopics: ['정식 취업 의도 직설적 표현'],
    legalNotes: ['D-4는 주로 어학당/어학원 학생', '취업 제한적'],
    aiInstruction: [
      '사용자는 D-4 어학연수 비자 보유자다.',
      '자소서는 한국어 학습에 대한 열정과 꾸준함을 중심으로 작성하라.',
      '문화 적응력과 장기 학업·커리어 계획을 자연스럽게 담아라.',
      '정식 취업 의도를 직설적으로 드러내기보다는 성장과 배움의 관점에서 서술하라.',
    ].join(' '),
  },
  other: {
    code: 'other',
    label: '기타 비자',
    labelEn: 'Other Visa',
    category: 'unknown',
    resumeTone: 'neutral',
    emphasisPoints: ['성실함', '적응력', '학습 의지'],
    avoidTopics: ['비자 세부 상황 언급'],
    legalNotes: ['비자별 취업 가능 여부 반드시 확인 필요'],
    aiInstruction: [
      '사용자의 비자 종류는 구체적으로 확인되지 않았다.',
      '자소서는 성실함, 적응력, 학습 의지 등 보편적 가치 중심으로 작성하라.',
      '비자 세부 사항은 언급하지 말고 개인의 강점과 경험에 집중하라.',
    ].join(' '),
  },
  none: {
    code: 'none',
    label: '비자 정보 없음',
    labelEn: 'No visa info',
    category: 'unknown',
    resumeTone: 'neutral',
    emphasisPoints: ['성실함', '적응력', '학습 의지'],
    avoidTopics: ['법적 지위 관련 내용'],
    legalNotes: ['법적 취업 자격 확인 권고'],
    aiInstruction: [
      '사용자의 비자 정보가 없다.',
      '자소서는 개인의 보편적 강점(성실함, 적응력, 학습 의지)에 집중하라.',
      '비자나 법적 지위 관련 내용은 일체 언급하지 말라.',
    ].join(' '),
  },
};

/** 비자 종류에 맞는 전략 조회. null이면 중립 전략 반환. */
export function getVisaStrategy(visa: VisaType | null | undefined): VisaStrategy {
  if (!visa) return VISA_STRATEGIES.other;
  return VISA_STRATEGIES[visa] ?? VISA_STRATEGIES.other;
}
