import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEnrollments } from '../contexts/EnrollmentContext';
import {
  fetchSchoolProgress,
  upsertSchoolProgress,
  fetchAllSchoolProgress,
  deleteSchoolProgress,
} from '../services/schoolProgressService';
import type {
  SchoolProgress,
  PeriodId,
  AptitudeResult,
  MarketScannerResult,
  EdgeMakerResult,
  ViralCardResult,
  PerfectPlannerResult,
  SimulationResult,
} from '../types/school';
import { SCHOOL_CURRICULUM, PRO_DURATION_DAYS } from '../types/school';

// ─── Auto-repair: 결과 데이터는 있는데 stamp가 false인 경우 보정 ───

function repairMissingStamps(prog: SchoolProgress): SchoolProgress {
  const resultChecks: { periodId: PeriodId; hasResult: boolean; completedAt?: string }[] = [
    {
      periodId: 'aptitude-test',
      hasResult: !!prog.aptitudeResult,
      completedAt: prog.aptitudeResult?.completedAt,
    },
    {
      periodId: 'market-scanner',
      hasResult: !!prog.marketCompassData?.marketScannerResult,
      completedAt: prog.marketCompassData?.marketScannerResult?.completedAt,
    },
    {
      periodId: 'edge-maker',
      hasResult: !!prog.marketCompassData?.edgeMakerResult,
      completedAt: prog.marketCompassData?.edgeMakerResult?.completedAt,
    },
    {
      periodId: 'viral-card-maker',
      hasResult: !!prog.marketCompassData?.viralCardResult,
      completedAt: prog.marketCompassData?.viralCardResult?.completedAt,
    },
    {
      periodId: 'perfect-planner',
      hasResult: !!prog.marketCompassData?.perfectPlannerResult,
      completedAt: prog.marketCompassData?.perfectPlannerResult?.completedAt,
    },
    {
      periodId: 'roas-simulator',
      hasResult: !!prog.simulationResult,
      completedAt: prog.simulationResult?.completedAt,
    },
  ];

  let needsRepair = false;
  const stamps = prog.stamps.map((s) => {
    const check = resultChecks.find((c) => c.periodId === s.periodId);
    if (check?.hasResult && !s.completed) {
      needsRepair = true;
      return { ...s, completed: true, completedAt: check.completedAt || new Date().toISOString() };
    }
    return s;
  });

  return needsRepair ? { ...prog, stamps } : prog;
}

// ─── 기본값 ───

function createDefaultProgress(): SchoolProgress {
  return {
    stamps: SCHOOL_CURRICULUM.map((p) => ({
      periodId: p.id,
      completed: false,
    })),
    graduation: {
      isGraduated: false,
    },
    enrolledAt: new Date().toISOString(),
  };
}

// ─── Main Hook ───

export function useSchoolProgress() {
  const { user } = useAuth();
  const { getEnrollment } = useEnrollments();
  const userId = user?.id;
  const digitalEnrollment = getEnrollment('digital-basics');
  const enrollmentId = digitalEnrollment?.id;
  const [progress, setProgress] = useState<SchoolProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ref to track latest progress synchronously across rapid successive calls
  // (prevents stale closure when saveResult + autoStamp are called back-to-back)
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
      const data = await fetchSchoolProgress(userId!);
      if (!cancelled) {
        const prog = data || createDefaultProgress();
        // Auto-repair: 결과 데이터는 있는데 stamp가 false인 경우 보정
        const repaired = repairMissingStamps(prog);
        setProgress(repaired);
        setIsLoading(false);
        // 보정이 있었으면 DB에도 저장
        if (repaired !== prog && enrollmentId) {
          upsertSchoolProgress(userId!, repaired, enrollmentId, 'marketing');
        }
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
      progressRef.current = updated; // sync update for next caller
      setProgress(updated); // optimistic
      await upsertSchoolProgress(userId, updated, enrollmentId, 'marketing');
    },
    [userId, enrollmentId],
  );

  // ─── Stamp functions ───

  const earnStamp = useCallback(
    async (periodId: PeriodId) => {
      await updateProgress((prev) => {
        const stamps = prev.stamps.map((s) =>
          s.periodId === periodId && !s.completed
            ? { ...s, completed: true, completedAt: new Date().toISOString() }
            : s,
        );
        return { ...prev, stamps };
      });
    },
    [updateProgress],
  );

  const autoStamp = useCallback(
    async (periodId: PeriodId): Promise<{ stamped: boolean }> => {
      await earnStamp(periodId);
      return { stamped: true };
    },
    [earnStamp],
  );

  const hasStamp = useCallback(
    (periodId: PeriodId): boolean => {
      if (!progress) return false;
      return progress.stamps.find((s) => s.periodId === periodId)?.completed ?? false;
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
    async (review: string) => {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + PRO_DURATION_DAYS);

      await updateProgress((prev) => ({
        ...prev,
        graduation: {
          isGraduated: true,
          graduatedAt: now.toISOString(),
          review,
          proExpiresAt: expiresAt.toISOString(),
        },
      }));
    },
    [updateProgress],
  );

  const isGraduated = useMemo(
    () => progress?.graduation.isGraduated ?? false,
    [progress],
  );

  const isProAccessValid = useMemo(() => {
    if (!progress?.graduation.isGraduated || !progress.graduation.proExpiresAt) {
      return false;
    }
    return new Date() < new Date(progress.graduation.proExpiresAt);
  }, [progress]);

  const proRemainingDays = useMemo(() => {
    if (!progress?.graduation.proExpiresAt) return 0;
    const diff = new Date(progress.graduation.proExpiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [progress]);

  const graduationReview = useMemo(
    () => progress?.graduation.review,
    [progress],
  );

  // ─── Aptitude ───

  const saveAptitudeResult = useCallback(
    async (result: AptitudeResult) => {
      await updateProgress((prev) => ({ ...prev, aptitudeResult: result }));
    },
    [updateProgress],
  );

  const aptitudeResult = useMemo(
    () => progress?.aptitudeResult,
    [progress],
  );

  const hasAptitudeResult = useMemo(
    () => !!progress?.aptitudeResult,
    [progress],
  );

  // ─── Market Compass ───

  const saveMarketScannerResult = useCallback(
    async (result: MarketScannerResult) => {
      await updateProgress((prev) => ({
        ...prev,
        marketCompassData: {
          ...prev.marketCompassData,
          marketScannerResult: result,
        },
      }));
    },
    [updateProgress],
  );

  const marketScannerResult = useMemo(
    () => progress?.marketCompassData?.marketScannerResult,
    [progress],
  );

  const saveEdgeMakerResult = useCallback(
    async (result: EdgeMakerResult) => {
      await updateProgress((prev) => ({
        ...prev,
        marketCompassData: {
          ...prev.marketCompassData,
          edgeMakerResult: result,
        },
      }));
    },
    [updateProgress],
  );

  const edgeMakerResult = useMemo(
    () => progress?.marketCompassData?.edgeMakerResult,
    [progress],
  );

  const saveViralCardResult = useCallback(
    async (result: ViralCardResult) => {
      await updateProgress((prev) => ({
        ...prev,
        marketCompassData: {
          ...prev.marketCompassData,
          viralCardResult: result,
        },
      }));
    },
    [updateProgress],
  );

  const viralCardResult = useMemo(
    () => progress?.marketCompassData?.viralCardResult,
    [progress],
  );

  const savePerfectPlannerResult = useCallback(
    async (result: PerfectPlannerResult) => {
      await updateProgress((prev) => ({
        ...prev,
        marketCompassData: {
          ...prev.marketCompassData,
          perfectPlannerResult: result,
        },
      }));
    },
    [updateProgress],
  );

  const perfectPlannerResult = useMemo(
    () => progress?.marketCompassData?.perfectPlannerResult,
    [progress],
  );

  // ─── Simulation ───

  const saveSimulationResult = useCallback(
    async (result: SimulationResult) => {
      await updateProgress((prev) => ({ ...prev, simulationResult: result }));
    },
    [updateProgress],
  );

  const hasSimulationResult = useMemo(
    () => !!progress?.simulationResult,
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
    isProAccessValid,
    proRemainingDays,
    graduationReview,

    // Aptitude
    saveAptitudeResult,
    aptitudeResult,
    hasAptitudeResult,

    // Market Compass
    saveMarketScannerResult,
    marketScannerResult,
    saveEdgeMakerResult,
    edgeMakerResult,
    saveViralCardResult,
    viralCardResult,
    savePerfectPlannerResult,
    perfectPlannerResult,

    // Simulation
    saveSimulationResult,
    hasSimulationResult,
  };
}

// ─── Admin Hook ───

export function useAdminSchoolProgress() {
  const [allData, setAllData] = useState<Array<{ userId: string; enrollmentId: string; schoolId: string; progress: SchoolProgress }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchAllSchoolProgress();
    setAllData(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const clearStudentProgress = useCallback(
    async (userId: string) => {
      await deleteSchoolProgress(userId);
      setAllData((prev) => prev.filter((d) => d.userId !== userId));
    },
    [],
  );

  const extendProAccess = useCallback(
    async (userId: string, additionalDays: number) => {
      const entry = allData.find((d) => d.userId === userId);
      if (!entry || !entry.progress.graduation.isGraduated) return;

      const currentExpiry = entry.progress.graduation.proExpiresAt
        ? new Date(entry.progress.graduation.proExpiresAt)
        : new Date();

      const base = currentExpiry < new Date() ? new Date() : currentExpiry;
      base.setDate(base.getDate() + additionalDays);

      const updated: SchoolProgress = {
        ...entry.progress,
        graduation: {
          ...entry.progress.graduation,
          proExpiresAt: base.toISOString(),
        },
      };

      await upsertSchoolProgress(userId, updated, entry.enrollmentId, entry.schoolId);
      setAllData((prev) =>
        prev.map((d) => (d.userId === userId ? { ...d, progress: updated } : d)),
      );
    },
    [allData],
  );

  return {
    allData,
    isLoading,
    loadAll,
    clearStudentProgress,
    extendProAccess,
  };
}
