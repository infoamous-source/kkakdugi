import type { TrackId } from './track';

// ─── 강사 ON/OFF 설정 타입 ───

/** 단일 항목의 ON/OFF 상태 */
export interface VisibilityItem {
  visible: boolean;
}

/** 트랙별 설정 (모듈 + 툴) */
export interface TrackVisibility {
  visible: boolean;
  modules: Record<string, VisibilityItem>;
  tools: Record<string, VisibilityItem>;
}

/** 기관/그룹별 오버라이드 설정 */
export interface OrgOverride {
  orgCode: string;
  tracks: Partial<Record<TrackId, Partial<TrackVisibility>>>;
}

/** 강사가 저장하는 전체 설정 */
export interface InstructorSettings {
  instructorCode: string;
  updatedAt: string;
  /** 기본 설정 (전체 학생 대상) */
  tracks: Record<TrackId, TrackVisibility>;
  /** 기관별 오버라이드 (기관마다 다르게 설정할 때) */
  orgOverrides?: OrgOverride[];
}

/** 기본 설정 생성 (전부 ON) */
export function createDefaultSettings(instructorCode: string): InstructorSettings {
  return {
    instructorCode,
    updatedAt: new Date().toISOString(),
    tracks: {
      'digital-basics': {
        visible: true,
        modules: {},
        tools: {},
      },
      marketing: {
        visible: true,
        modules: {},
        tools: {},
      },
      career: {
        visible: true,
        modules: {},
        tools: {},
      },
    },
  };
}
