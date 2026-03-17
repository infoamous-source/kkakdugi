import type { PaymentMethod } from '../../core/types';
import { formatPrice, calculateTax } from '../../core/utils';

export { formatPrice, calculateTax };

export type HospitalScreen =
  | 'welcome'
  | 'visitType'
  | 'department'
  | 'doctor'
  | 'identity'
  | 'confirmInfo'
  | 'payment'
  | 'complete';

export const HOSPITAL_SCREEN_ORDER: HospitalScreen[] = [
  'welcome', 'visitType', 'department', 'doctor',
  'identity', 'confirmInfo', 'payment', 'complete',
];

export type VisitType = 'first' | 'return';

export interface Department {
  id: string;
  nameKey: string;
  label: string;
  icon: string;  // SVG path or simple icon identifier
  color: string;
}

export interface Doctor {
  id: string;
  name: string;
  departmentId: string;
  specialty: string;
  available: boolean;
  schedule: string; // e.g. "오전 09:00 ~ 12:00"
}

export const departments: Department[] = [
  { id: 'internal',      nameKey: 'kkakdugi.hospital.dept.internal',      label: '내과',         icon: 'heart',  color: '#E74C3C' },
  { id: 'orthopedic',    nameKey: 'kkakdugi.hospital.dept.orthopedic',    label: '정형외과',     icon: 'bone',   color: '#3498DB' },
  { id: 'dermatology',   nameKey: 'kkakdugi.hospital.dept.dermatology',   label: '피부과',       icon: 'skin',   color: '#E8A87C' },
  { id: 'ent',           nameKey: 'kkakdugi.hospital.dept.ent',           label: '이비인후과',   icon: 'ear',    color: '#9B59B6' },
  { id: 'ophthalmology', nameKey: 'kkakdugi.hospital.dept.ophthalmology', label: '안과',         icon: 'eye',    color: '#2ECC71' },
  { id: 'dental',        nameKey: 'kkakdugi.hospital.dept.dental',        label: '치과',         icon: 'tooth',  color: '#1ABC9C' },
  { id: 'obgyn',         nameKey: 'kkakdugi.hospital.dept.obgyn',         label: '산부인과',     icon: 'baby',   color: '#FF69B4' },
  { id: 'pediatrics',    nameKey: 'kkakdugi.hospital.dept.pediatrics',    label: '소아청소년과', icon: 'child',  color: '#F39C12' },
  { id: 'neurology',     nameKey: 'kkakdugi.hospital.dept.neurology',     label: '신경과',       icon: 'brain',  color: '#8E44AD' },
  { id: 'urology',       nameKey: 'kkakdugi.hospital.dept.urology',       label: '비뇨의학과',   icon: 'kidney', color: '#16A085' },
];

export const doctors: Doctor[] = [
  // Internal medicine
  { id: 'doc-1',  name: '김민수', departmentId: 'internal',      specialty: '호흡기 내과',       available: true,  schedule: '오전 09:00 ~ 12:00' },
  { id: 'doc-2',  name: '이정현', departmentId: 'internal',      specialty: '소화기 내과',       available: true,  schedule: '오후 13:00 ~ 17:00' },
  { id: 'doc-3',  name: '박서연', departmentId: 'internal',      specialty: '순환기 내과',       available: false, schedule: '휴진' },
  // Orthopedic
  { id: 'doc-4',  name: '정우진', departmentId: 'orthopedic',    specialty: '관절 전문',         available: true,  schedule: '오전 09:00 ~ 12:00' },
  { id: 'doc-5',  name: '최하늘', departmentId: 'orthopedic',    specialty: '척추 전문',         available: true,  schedule: '종일 09:00 ~ 17:00' },
  // Dermatology
  { id: 'doc-6',  name: '한소희', departmentId: 'dermatology',   specialty: '피부 일반',         available: true,  schedule: '오전 09:00 ~ 12:00' },
  // ENT
  { id: 'doc-7',  name: '윤성준', departmentId: 'ent',           specialty: '이비인후과 일반',   available: true,  schedule: '종일 09:00 ~ 17:00' },
  // Ophthalmology
  { id: 'doc-8',  name: '강지윤', departmentId: 'ophthalmology', specialty: '안과 일반',         available: true,  schedule: '오후 13:00 ~ 17:00' },
  // Dental
  { id: 'doc-9',  name: '임도현', departmentId: 'dental',        specialty: '치과 보존',         available: true,  schedule: '오전 09:00 ~ 12:00' },
  { id: 'doc-10', name: '송예진', departmentId: 'dental',        specialty: '교정 전문',         available: false, schedule: '휴진' },
  // Others - one doctor each
  { id: 'doc-11', name: '조은채', departmentId: 'obgyn',         specialty: '산부인과 일반',     available: true,  schedule: '오전 09:00 ~ 12:00' },
  { id: 'doc-12', name: '배준호', departmentId: 'pediatrics',    specialty: '소아청소년과 일반', available: true,  schedule: '종일 09:00 ~ 17:00' },
  { id: 'doc-13', name: '신하린', departmentId: 'neurology',     specialty: '신경과 일반',       available: true,  schedule: '오후 13:00 ~ 17:00' },
  { id: 'doc-14', name: '권태민', departmentId: 'urology',       specialty: '비뇨의학과 일반',   available: true,  schedule: '오전 09:00 ~ 12:00' },
];

export const paymentMethods: PaymentMethod[] = [
  { id: 'card',             nameKey: 'kkakdugi.screens.payment.card',       subKey: 'kkakdugi.screens.payment.cardSub', icon: 'card' },
  { id: 'health-insurance', nameKey: 'kkakdugi.hospital.payment.insurance', icon: 'insurance' },
];

// Consultation fee (simulated)
export const CONSULTATION_FEE = 5000; // 초진 기본 진찰료

export const HOSPITAL_THEME = {
  headerBg:     '#0D7377',   // teal
  primaryBtn:   '#14919B',   // medium teal
  primaryHover: '#0A6065',
  accentGreen:  '#2ECC71',   // success green
  bgLight:      '#F0FAFA',   // very light teal
  bgCard:       '#FFFFFF',
  borderLight:  '#D4E8E8',
  textDark:     '#1A2F2F',
  textMid:      '#4A6B6B',
  textLight:    '#8BAAAA',
} as const;
