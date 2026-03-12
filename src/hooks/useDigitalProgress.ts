import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchDigitalProgress, upsertDigitalProgress } from '../services/digitalProgressService';
import type { DigitalProgress } from '../types/digital';

const MODULE_IDS = ['db-01', 'db-02', 'db-03', 'db-04'];

function getDefault(moduleId: string, existing?: DigitalProgress): DigitalProgress {
  return existing || { moduleId, completedSteps: [], completedPractices: [] };
}

export function useDigitalProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, DigitalProgress>>({});
  const [isLoading, setIsLoading] = useState(false);
  const skipPersist = useRef(true);
  const changedModulesRef = useRef<Set<string>>(new Set());

  // Load from Supabase on mount / user change
  useEffect(() => {
    if (!user?.id) {
      setProgress({});
      return;
    }

    setIsLoading(true);
    fetchDigitalProgress(user.id)
      .then((rows) => {
        const map: Record<string, DigitalProgress> = {};
        rows.forEach((r) => {
          map[r.module_id] = {
            moduleId: r.module_id,
            completedSteps: r.completed_steps,
            completedPractices: r.completed_practices,
            completedAt: r.completed_at ?? undefined,
          };
        });
        skipPersist.current = true;
        setProgress(map);
      })
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  // Persist only changed modules to Supabase
  useEffect(() => {
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    if (!user?.id) return;

    const changed = changedModulesRef.current;
    if (changed.size === 0) return;

    changed.forEach((moduleId) => {
      const mod = progress[moduleId];
      if (!mod) return;
      upsertDigitalProgress(user.id, moduleId, {
        completedSteps: mod.completedSteps,
        completedPractices: mod.completedPractices,
        completedAt: mod.completedAt,
      });
    });
    changed.clear();
  }, [progress, user?.id]);

  const markStepCompleted = useCallback((moduleId: string, stepId: string) => {
    changedModulesRef.current.add(moduleId);
    setProgress((prev) => {
      const mod = getDefault(moduleId, prev[moduleId]);
      if (mod.completedSteps.includes(stepId)) return prev;
      return {
        ...prev,
        [moduleId]: {
          ...mod,
          completedSteps: [...mod.completedSteps, stepId],
        },
      };
    });
  }, []);

  const toggleStep = useCallback((moduleId: string, stepId: string) => {
    changedModulesRef.current.add(moduleId);
    setProgress((prev) => {
      const mod = getDefault(moduleId, prev[moduleId]);
      const has = mod.completedSteps.includes(stepId);
      return {
        ...prev,
        [moduleId]: {
          ...mod,
          completedSteps: has
            ? mod.completedSteps.filter((s) => s !== stepId)
            : [...mod.completedSteps, stepId],
        },
      };
    });
  }, []);

  const markPracticeCompleted = useCallback((moduleId: string, practiceId: string) => {
    changedModulesRef.current.add(moduleId);
    setProgress((prev) => {
      const mod = getDefault(moduleId, prev[moduleId]);
      if (mod.completedPractices.includes(practiceId)) return prev;
      return {
        ...prev,
        [moduleId]: {
          ...mod,
          completedPractices: [...mod.completedPractices, practiceId],
        },
      };
    });
  }, []);

  const togglePractice = useCallback((moduleId: string, practiceId: string) => {
    changedModulesRef.current.add(moduleId);
    setProgress((prev) => {
      const mod = getDefault(moduleId, prev[moduleId]);
      const has = mod.completedPractices.includes(practiceId);
      return {
        ...prev,
        [moduleId]: {
          ...mod,
          completedPractices: has
            ? mod.completedPractices.filter((p) => p !== practiceId)
            : [...mod.completedPractices, practiceId],
        },
      };
    });
  }, []);

  const markModuleCompleted = useCallback((moduleId: string) => {
    changedModulesRef.current.add(moduleId);
    setProgress((prev) => ({
      ...prev,
      [moduleId]: {
        ...getDefault(moduleId, prev[moduleId]),
        completedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const getModuleProgress = useCallback(
    (moduleId: string): DigitalProgress => {
      return progress[moduleId] || { moduleId, completedSteps: [], completedPractices: [] };
    },
    [progress],
  );

  const isStepCompleted = useCallback(
    (moduleId: string, stepId: string): boolean => {
      return progress[moduleId]?.completedSteps?.includes(stepId) ?? false;
    },
    [progress],
  );

  const isPracticeCompleted = useCallback(
    (moduleId: string, practiceId: string): boolean => {
      return progress[moduleId]?.completedPractices?.includes(practiceId) ?? false;
    },
    [progress],
  );

  const getCompletionRate = useCallback((): number => {
    const completed = MODULE_IDS.filter((id) => progress[id]?.completedAt).length;
    return Math.round((completed / MODULE_IDS.length) * 100);
  }, [progress]);

  const getModuleCompletionRate = useCallback(
    (moduleId: string, totalSteps: number, totalPractices: number): number => {
      const mod = progress[moduleId];
      if (!mod) return 0;
      const total = totalSteps + totalPractices;
      if (total === 0) return 0;
      const done = (mod.completedSteps?.length ?? 0) + (mod.completedPractices?.length ?? 0);
      return Math.round((done / total) * 100);
    },
    [progress],
  );

  return {
    progress,
    isLoading,
    markStepCompleted,
    toggleStep,
    markPracticeCompleted,
    togglePractice,
    markModuleCompleted,
    getModuleProgress,
    isStepCompleted,
    isPracticeCompleted,
    getCompletionRate,
    getModuleCompletionRate,
  };
}
