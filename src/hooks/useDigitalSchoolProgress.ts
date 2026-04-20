import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEnrollments } from '../contexts/EnrollmentContext';
import {
  fetchSchoolProgress,
  upsertSchoolProgress,
} from '../services/schoolProgressService';
import type { SchoolProgress, StampProgress } from '../types/school';
import type { DigitalPeriodId, DigitalChecklistResult } from '../types/digitalSchool';
import { DIGITAL_SCHOOL_CURRICULUM } from '../types/digitalSchool';

// ─── 기본값 ───

function createDefaultDigitalProgress(): SchoolProgress {
  return {
    stamps: DIGITAL_SCHOOL_CURRICULUM.map((p) => ({
      periodId: p.id as string,
      completed: false,
    })) as StampProgress[],
    graduation: {
      isGraduated: false,
    },
    enrolledAt: new Date().toISOString(),
  };
}

// ─── Main Hook ───

export function useDigitalSchoolProgress() {
  const { user } = useAuth();
  const { getEnrollment } = useEnrollments();
  const userId = user?.id;
  const digitalEnrollment = getEnrollment('digital-basics');
  const enrollmentId = digitalEnrollment?.id;
  const [progress, setProgress] = useState<SchoolProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const progressRef = useRef<SchoolProgress | null>(null);
  progressRef.current = progress;

  // Load on mount / userId change
  useEffect(() => {
    if (!userId) {
      setProgress(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      // Fetch progress for digital-basics school
      const data = await fetchSchoolProgress(userId!);
      if (!cancelled) {
        const prog = data || createDefaultDigitalProgress();
        setProgress(prog);
        setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  // Helper to update progress (optimistic + persist)
  const updateProgress = useCallback(
    async (updater: (prev: SchoolProgress) => SchoolProgress) => {
      if (!userId || !enrollmentId) return;
      const current = progressRef.current;
      if (!current) return;
      const updated = updater(current);
      progressRef.current = updated;
      setProgress(updated);
      await upsertSchoolProgress(userId, updated, enrollmentId, 'digital-basics');
    },
    [userId, enrollmentId],
  );

  // ─── Stamp functions ───

  const earnStamp = useCallback(
    async (periodId: DigitalPeriodId) => {
      await updateProgress((prev) => {
        const stamps = prev.stamps.map((s) =>
          (s.periodId as string) === periodId && !s.completed
            ? { ...s, completed: true, completedAt: new Date().toISOString() }
            : s,
        );
        return { ...prev, stamps };
      });
    },
    [updateProgress],
  );

  const autoStamp = useCallback(
    async (periodId: DigitalPeriodId): Promise<{ stamped: boolean }> => {
      await earnStamp(periodId);
      return { stamped: true };
    },
    [earnStamp],
  );

  const hasStamp = useCallback(
    (periodId: DigitalPeriodId): boolean => {
      if (!progress) return false;
      return progress.stamps.find((s) => (s.periodId as string) === periodId)?.completed ?? false;
    },
    [progress],
  );

  const completedStampCount = useMemo(
    () => progress?.stamps.filter((s) => s.completed).length ?? 0,
    [progress],
  );

  const hasAllStamps = useMemo(
    () => progress?.stamps.every((s) => s.completed) ?? false,
    [progress],
  );

  // ─── Graduation functions ───

  const canGraduate = useMemo(
    () => hasAllStamps && !(progress?.graduation.isGraduated ?? false),
    [hasAllStamps, progress],
  );

  const graduate = useCallback(
    async () => {
      const now = new Date();
      await updateProgress((prev) => ({
        ...prev,
        graduation: {
          isGraduated: true,
          graduatedAt: now.toISOString(),
        },
      }));
    },
    [updateProgress],
  );

  const isGraduated = useMemo(
    () => progress?.graduation.isGraduated ?? false,
    [progress],
  );

  // ─── Checklist results (stored in simulationResult as generic JSON) ───

  const saveChecklistResult = useCallback(
    async (result: DigitalChecklistResult) => {
      await updateProgress((prev) => {
        const existing = (prev.simulationResult as unknown as Record<string, DigitalChecklistResult>) || {};
        return {
          ...prev,
          simulationResult: {
            ...existing,
            [result.periodId]: result,
          } as unknown as typeof prev.simulationResult,
        };
      });
    },
    [updateProgress],
  );

  const getChecklistResult = useCallback(
    (periodId: DigitalPeriodId): DigitalChecklistResult | undefined => {
      const results = progress?.simulationResult as unknown as Record<string, DigitalChecklistResult> | undefined;
      return results?.[periodId];
    },
    [progress],
  );

  return {
    progress,
    isLoading,

    // Stamps
    earnStamp,
    autoStamp,
    hasStamp,
    completedStampCount,
    hasAllStamps,

    // Graduation
    canGraduate,
    graduate,
    isGraduated,

    // Checklist
    saveChecklistResult,
    getChecklistResult,
  };
}
