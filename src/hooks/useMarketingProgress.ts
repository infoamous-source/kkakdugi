import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchMarketingProgress, upsertMarketingProgress } from '../services/marketingProgressService';
import type { ModuleProgress } from '../types/marketing';

function getDefault(moduleId: string, existing?: ModuleProgress): ModuleProgress {
  return existing || { moduleId, toolOutputCount: 0 };
}

export function useMarketingProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({});
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
    fetchMarketingProgress(user.id)
      .then((rows) => {
        const map: Record<string, ModuleProgress> = {};
        rows.forEach((r) => {
          map[r.module_id] = {
            moduleId: r.module_id,
            viewedAt: r.viewed_at ?? undefined,
            toolUsedAt: r.tool_used_at ?? undefined,
            toolOutputCount: r.tool_output_count,
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
      upsertMarketingProgress(user.id, moduleId, {
        viewedAt: mod.viewedAt,
        toolUsedAt: mod.toolUsedAt,
        toolOutputCount: mod.toolOutputCount,
        completedAt: mod.completedAt,
      });
    });
    changed.clear();
  }, [progress, user?.id]);

  const markViewed = useCallback((moduleId: string) => {
    changedModulesRef.current.add(moduleId);
    setProgress((prev) => ({
      ...prev,
      [moduleId]: {
        ...getDefault(moduleId, prev[moduleId]),
        viewedAt: prev[moduleId]?.viewedAt || new Date().toISOString(),
      },
    }));
  }, []);

  const markToolUsed = useCallback((moduleId: string) => {
    changedModulesRef.current.add(moduleId);
    setProgress((prev) => ({
      ...prev,
      [moduleId]: {
        ...getDefault(moduleId, prev[moduleId]),
        toolUsedAt: new Date().toISOString(),
        toolOutputCount: (prev[moduleId]?.toolOutputCount || 0) + 1,
      },
    }));
  }, []);

  const markCompleted = useCallback((moduleId: string) => {
    changedModulesRef.current.add(moduleId);
    setProgress((prev) => ({
      ...prev,
      [moduleId]: {
        ...getDefault(moduleId, prev[moduleId]),
        completedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const getModuleProgress = useCallback((moduleId: string): ModuleProgress => {
    return progress[moduleId] || { moduleId, toolOutputCount: 0 };
  }, [progress]);

  const getCompletionRate = useCallback((): number => {
    const moduleIds = ['mk-01', 'mk-02', 'mk-03', 'mk-04', 'mk-05', 'mk-06', 'mk-07'];
    const completed = moduleIds.filter((id) => progress[id]?.completedAt).length;
    return Math.round((completed / moduleIds.length) * 100);
  }, [progress]);

  return {
    progress,
    isLoading,
    markViewed,
    markToolUsed,
    markCompleted,
    getModuleProgress,
    getCompletionRate,
  };
}
