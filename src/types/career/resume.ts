/**
 * K-이력서 (Korean Resume) 데이터 타입
 *
 * 자소서 빌더 세션에서 수집한 데이터를 재사용해 한국식 이력서로 변환한다.
 * 한 번의 인터뷰 → 자소서 + 이력서 두 개 산출 (ROI 최대).
 *
 * 한국식 이력서 표준 섹션:
 *  1. 인적사항 (이름/생년월일/연락처/국적/비자)
 *  2. 학력 (모국 + 한국)
 *  3. 경력 (모국 + 한국)
 *  4. 자격증·어학 (TOPIK, 운전면허 등)
 *  5. 자기소개 (짧은 요약)
 */

export interface KResumePersonalInfo {
  name: string;
  nameEn?: string;
  birthYear?: number;
  gender?: 'male' | 'female' | 'other';
  country?: string;
  visaType?: string;
  yearsInKorea?: string;
  koreanLevel?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface KResumeEducation {
  id: string;
  schoolName: string;
  degree: string; // "고등학교 졸업", "대학교 학사", "어학당", etc.
  major?: string;
  startYear?: number;
  endYear?: number;
  country: 'home' | 'korea';
  note?: string;
}

export interface KResumeCareer {
  id: string;
  company: string;
  role: string;
  startYear?: number;
  endYear?: number;
  country: 'home' | 'korea';
  /** 주요 업무 및 성과 (bullet 포인트 배열) */
  achievements: string[];
  /** 이 경력이 매핑되는 역량 ID */
  traitIds?: string[];
}

export interface KResumeCertification {
  id: string;
  name: string;
  issuer?: string;
  year?: number;
  /** TOPIK 급수나 운전면허 종류 등 */
  detail?: string;
}

export interface KResumeSummary {
  /** 3~5줄 짧은 자기소개 */
  body: string;
  /** 핵심 역량 키워드 */
  keywords: string[];
}

export interface KResume {
  version: string;
  personal: KResumePersonalInfo;
  summary: KResumeSummary;
  education: KResumeEducation[];
  career: KResumeCareer[];
  certifications: KResumeCertification[];
  /** 생성 메타 */
  generatedAt: string;
  targetCompany?: string;
  targetJobTitle?: string;
}
