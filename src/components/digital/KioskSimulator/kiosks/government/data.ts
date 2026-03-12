import { formatPrice } from '../../core/utils';

export { formatPrice };

export type GovernmentScreen =
  | 'welcome'
  | 'identity'
  | 'documentSelect'
  | 'documentOptions'
  | 'confirmDocument'
  | 'payment'
  | 'processing'
  | 'complete';

export const GOVERNMENT_SCREEN_ORDER: GovernmentScreen[] = [
  'welcome', 'identity', 'documentSelect', 'documentOptions',
  'confirmDocument', 'payment', 'processing', 'complete',
];

export const GOVERNMENT_THEME = {
  headerBg: '#1E293B',
  primary: '#334155',
  accent: '#0EA5E9',
  surface: '#F8FAFC',
  text: '#0F172A',
  textLight: '#64748B',
  success: '#22C55E',
  border: '#CBD5E1',
  bgLight: '#F8FAFC',
  bgCard: '#FFFFFF',
} as const;

export interface GovernmentDocument {
  id: string;
  name: string;
  fee: number;
  description: string;
}

export const DOCUMENTS: GovernmentDocument[] = [
  { id: 'resident_copy', name: '주민등록등본', fee: 400, description: '세대원 전체의 주소 및 세대 구성 확인' },
  { id: 'resident_abstract', name: '주민등록초본', fee: 400, description: '개인의 주소 이동 이력 확인' },
  { id: 'family_relations', name: '가족관계증명서', fee: 1000, description: '가족관계 등록부 기록 확인' },
  { id: 'basic_cert', name: '기본증명서', fee: 1000, description: '출생, 사망, 국적 등 기본사항 확인' },
  { id: 'marriage_cert', name: '혼인관계증명서', fee: 1000, description: '혼인 관련 사항 확인' },
  { id: 'tax_cert', name: '납세증명서', fee: 0, description: '국세 납부 사실 증명' },
  { id: 'health_insurance', name: '건강보험자격확인서', fee: 0, description: '건강보험 자격 및 보험료 확인' },
  { id: 'driving_record', name: '운전경력증명서', fee: 0, description: '운전면허 취득 및 경력 확인' },
];

export const PURPOSES = ['일반', '금융기관 제출용', '관공서 제출용', '학교 제출용'] as const;
export type Purpose = typeof PURPOSES[number];
