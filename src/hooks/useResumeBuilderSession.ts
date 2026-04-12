/**
 * useResumeBuilderSession — 자소서 빌더 세션 상태 훅
 *
 * 0단계~4단계의 모든 사용자 입력을 localStorage에 자동 저장·복원한다.
 * 외국인 학습자는 한 번에 다 못 끝내는 경우가 많아서 "이어하기"가 필수.
 *
 * Phase F 이후에 Supabase 테이블로 승격 가능.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { StrengthResult } from '../types/career/strengths';
import type { KResume } from '../types/career/resume';
import {
  loadSessionFromSupabase,
  saveSessionToSupabase,
  deleteSessionFromSupabase,
} from '../services/career/sessionService';

export type BuilderStep =
  | 'initial_profile'
  | 'card_picking'
  | 'nickname'
  | 'quiz'
  | 'reveal'
  | 'interview'
  | 'resume_target'
  | 'resume_result';

export interface InterviewAnswer {
  questionId: string;
  answeredAt: string;
  originalLanguage?: string;
  originalText?: string;    // 사용자가 답한 원문 (모국어 포함)
  koreanText?: string;      // AI 번역된 한국어 (있는 경우)
  starBreakdown?: {
    situation?: string;
    task?: string;
    action?: string;
    result?: string;
  };
}

export interface ResumeTarget {
  company: string;
  jobTitle: string;
  industry?: string;
  wordLimits?: {
    growth?: number;      // 성장 과정
    personality?: number; // 성격 장단점
    motivation?: number;  // 지원 동기
    aspiration?: number;  // 입사 후 포부
  };
}

export interface ResumeDraft {
  growth: string;
  personality: string;
  motivation: string;
  aspiration: string;
  /** 각 항목이 어느 trait·사례에서 나왔는지 출처 */
  sources: {
    growth: { traitIds: string[]; interviewQuestionIds: string[] };
    personality: { traitIds: string[]; interviewQuestionIds: string[] };
    motivation: { traitIds: string[]; interviewQuestionIds: string[] };
    aspiration: { traitIds: string[]; interviewQuestionIds: string[] };
  };
  generatedAt: string;
}

export interface ResumeBuilderSession {
  sessionId: string;
  currentStep: BuilderStep;
  // 0-A
  initialProfile: {
    desiredJob?: string;
    homeCountryJob?: string;
  };
  // 0-B
  selectedCardIds: string[];
  // 0-C
  nickname?: string;
  // 0-D
  quizAnswers: {
    workStyle?: 'alone' | 'team';
    praiseType?: 'accurate' | 'fast' | 'kind' | 'creative';
    taskType?: 'routine' | 'new';
  };
  // 0-E
  resultStrengths: StrengthResult[];
  rejectedResultIds: string[];
  // 1 (STAR 인터뷰)
  selectedQuestionIds: string[];
  interviewAnswers: InterviewAnswer[];
  // 3 (자소서 타깃)
  resumeTarget?: ResumeTarget;
  // 4 (자소서 결과)
  resumeDrafts: ResumeDraft[];
  // 5 (K-이력서) — Phase G
  kResumes?: KResume[];
  // 6 (면접 시뮬레이터 기록) — Phase H
  interviewPractices?: Array<{
    id: string;
    question: string;
    userAnswer: string;
    feedback: string;
    score: number; // 0~100
    practicedAt: string;
  }>;
  // 메타
  startedAt: string;
  updatedAt: string;
}

const STORAGE_KEY_PREFIX = 'kkakdugi-resume-builder-session-';

function makeSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptySession(): ResumeBuilderSession {
  const now = new Date().toISOString();
  return {
    sessionId: makeSessionId(),
    currentStep: 'initial_profile',
    initialProfile: {},
    selectedCardIds: [],
    quizAnswers: {},
    resultStrengths: [],
    rejectedResultIds: [],
    selectedQuestionIds: [],
    interviewAnswers: [],
    resumeDrafts: [],
    kResumes: [],
    interviewPractices: [],
    startedAt: now,
    updatedAt: now,
  };
}

function loadSession(userId: string): ResumeBuilderSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + userId);
    if (!raw) return emptySession();
    const parsed = JSON.parse(raw) as ResumeBuilderSession;
    // 간단 검증
    if (!parsed.sessionId || !parsed.currentStep) return emptySession();
    return parsed;
  } catch {
    return emptySession();
  }
}

function saveSession(userId: string, session: ResumeBuilderSession): void {
  try {
    localStorage.setItem(
      STORAGE_KEY_PREFIX + userId,
      JSON.stringify({ ...session, updatedAt: new Date().toISOString() }),
    );
  } catch {
    // quota exceeded 등 무시
  }
}

/** 자소서 빌더 세션 훅 — localStorage + Supabase 이중 저장·복원 */
export function useResumeBuilderSession(userId: string | null | undefined) {
  const [session, setSession] = useState<ResumeBuilderSession>(() =>
    userId ? loadSession(userId) : emptySession(),
  );
  const supabaseSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // userId 바뀌면 해당 사용자 세션 재로딩 (Supabase 우선 → localStorage 폴백)
  useEffect(() => {
    if (!userId) return;
    const localData = loadSession(userId);
    setSession(localData);
    // Supabase에서 더 최신 버전이 있는지 비동기 확인
    loadSessionFromSupabase(userId).then((remote) => {
      if (remote && remote.updatedAt > localData.updatedAt) {
        setSession(remote);
        saveSession(userId, remote); // 로컬도 동기화
      }
    });
  }, [userId]);

  // 세션 변경 시 localStorage 즉시 저장 + Supabase 디바운스 2초 저장
  useEffect(() => {
    if (!userId) return;
    saveSession(userId, session);
    // Supabase 디바운스 저장 (네트워크 부하 최소화)
    if (supabaseSaveTimer.current) clearTimeout(supabaseSaveTimer.current);
    supabaseSaveTimer.current = setTimeout(() => {
      saveSessionToSupabase(userId, session);
    }, 2000);
    return () => {
      if (supabaseSaveTimer.current) clearTimeout(supabaseSaveTimer.current);
    };
  }, [userId, session]);

  const updateSession = useCallback(
    (patch: Partial<ResumeBuilderSession>) => {
      setSession((prev) => ({ ...prev, ...patch, updatedAt: new Date().toISOString() }));
    },
    [],
  );

  const goToStep = useCallback((step: BuilderStep) => {
    setSession((prev) => ({ ...prev, currentStep: step }));
  }, []);

  /** 강점 발견만 리셋 (인터뷰·자소서 결과는 유지) */
  const resetStrengthDiscovery = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      selectedCardIds: [],
      nickname: undefined,
      quizAnswers: {},
      resultStrengths: [],
      rejectedResultIds: [],
      currentStep: 'card_picking',
    }));
  }, []);

  /** 전체 세션 리셋 (localStorage + Supabase 모두) */
  const resetAll = useCallback(() => {
    if (userId) {
      localStorage.removeItem(STORAGE_KEY_PREFIX + userId);
      deleteSessionFromSupabase(userId);
    }
    setSession(emptySession());
  }, [userId]);

  return {
    session,
    updateSession,
    goToStep,
    resetStrengthDiscovery,
    resetAll,
  };
}
