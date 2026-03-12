import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { TrackId } from '../types/track';
import {
  type InstructorSettings,
  createDefaultSettings,
} from '../types/instructorSettings';
import {
  fetchInstructorSettings,
  upsertInstructorSettings,
} from '../services/instructorSettingsService';

// ─── Context 타입 ───

interface VisibilityContextType {
  /** 현재 설정 객체 */
  settings: InstructorSettings | null;

  /** 로딩 중 여부 */
  isLoading: boolean;

  /** 트랙이 보이는지 (기본값: true) */
  isTrackVisible: (trackId: TrackId) => boolean;

  /** 모듈이 보이는지 (기본값: true) */
  isModuleVisible: (trackId: TrackId, moduleId: string) => boolean;

  /** 툴이 보이는지 (기본값: true) */
  isToolVisible: (trackId: TrackId, toolId: string) => boolean;

  /** [강사 전용] 트랙 ON/OFF */
  setTrackVisible: (trackId: TrackId, visible: boolean) => void;

  /** [강사 전용] 모듈 ON/OFF */
  setModuleVisible: (trackId: TrackId, moduleId: string, visible: boolean) => void;

  /** [강사 전용] 툴 ON/OFF */
  setToolVisible: (trackId: TrackId, toolId: string, visible: boolean) => void;
}

const VisibilityContext = createContext<VisibilityContextType | null>(null);

// ─── Provider ───

export function VisibilityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<InstructorSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 사용자 변경 시 설정 로드 (Supabase - instructor_id = user.id)
  useEffect(() => {
    if (!user?.id || user?.role !== 'instructor') {
      setSettings(null);
      return;
    }

    setIsLoading(true);
    fetchInstructorSettings(user.id)
      .then((row) => {
        if (row) {
          // DB settings JSONB → InstructorSettings
          const tracks = (row.settings as Record<string, unknown>).tracks as InstructorSettings['tracks'] | undefined;
          if (tracks) {
            setSettings({
              instructorCode: user.instructorCode || '',
              updatedAt: row.updated_at,
              tracks,
            });
          } else {
            setSettings(null);
          }
        } else {
          setSettings(null);
        }
      })
      .finally(() => setIsLoading(false));
  }, [user?.id, user?.role, user?.instructorCode]);

  // 설정 저장 헬퍼 (Supabase - instructor_id = user.id)
  const saveSettings = useCallback(
    (newSettings: InstructorSettings) => {
      newSettings.updatedAt = new Date().toISOString();
      setSettings({ ...newSettings });

      // Persist to Supabase (fire-and-forget)
      if (user?.id) {
        upsertInstructorSettings(user.id, {
          tracks: newSettings.tracks,
        });
      }
    },
    [user?.id],
  );

  // 현재 유효한 설정 가져오기 (없으면 기본값 생성)
  const getOrCreateSettings = useCallback((): InstructorSettings => {
    if (settings) return { ...settings };
    const code = user?.instructorCode || 'DEFAULT';
    return createDefaultSettings(code);
  }, [settings, user?.instructorCode]);

  // ─── 읽기 함수 (학생 + 강사 공용) ───

  const isTrackVisible = useCallback(
    (trackId: TrackId): boolean => {
      if (!settings) return true; // 설정 없으면 전부 보임
      const track = settings.tracks[trackId];
      if (!track) return true;
      return track.visible;
    },
    [settings],
  );

  const isModuleVisible = useCallback(
    (trackId: TrackId, moduleId: string): boolean => {
      if (!settings) return true;
      const track = settings.tracks[trackId];
      if (!track) return true;
      if (!track.visible) return false; // 트랙이 OFF면 모듈도 안 보임
      const mod = track.modules[moduleId];
      if (!mod) return true; // 설정 안 된 모듈은 기본 ON
      return mod.visible;
    },
    [settings],
  );

  const isToolVisible = useCallback(
    (trackId: TrackId, toolId: string): boolean => {
      if (!settings) return true;
      const track = settings.tracks[trackId];
      if (!track) return true;
      if (!track.visible) return false;
      const tool = track.tools[toolId];
      if (!tool) return true; // 설정 안 된 툴은 기본 ON
      return tool.visible;
    },
    [settings],
  );

  // ─── 쓰기 함수 (강사 전용) ───

  const setTrackVisible = useCallback(
    (trackId: TrackId, visible: boolean) => {
      if (user?.role !== 'instructor') return;
      const s = getOrCreateSettings();
      if (!s.tracks[trackId]) {
        s.tracks[trackId] = { visible, modules: {}, tools: {} };
      } else {
        s.tracks[trackId].visible = visible;
      }
      saveSettings(s);
    },
    [user?.role, getOrCreateSettings, saveSettings],
  );

  const setModuleVisible = useCallback(
    (trackId: TrackId, moduleId: string, visible: boolean) => {
      if (user?.role !== 'instructor') return;
      const s = getOrCreateSettings();
      if (!s.tracks[trackId]) {
        s.tracks[trackId] = { visible: true, modules: {}, tools: {} };
      }
      s.tracks[trackId].modules[moduleId] = { visible };
      saveSettings(s);
    },
    [user?.role, getOrCreateSettings, saveSettings],
  );

  const setToolVisible = useCallback(
    (trackId: TrackId, toolId: string, visible: boolean) => {
      if (user?.role !== 'instructor') return;
      const s = getOrCreateSettings();
      if (!s.tracks[trackId]) {
        s.tracks[trackId] = { visible: true, modules: {}, tools: {} };
      }
      s.tracks[trackId].tools[toolId] = { visible };
      saveSettings(s);
    },
    [user?.role, getOrCreateSettings, saveSettings],
  );

  return (
    <VisibilityContext.Provider
      value={useMemo(() => ({
        settings,
        isLoading,
        isTrackVisible,
        isModuleVisible,
        isToolVisible,
        setTrackVisible,
        setModuleVisible,
        setToolVisible,
      }), [settings, isLoading, isTrackVisible, isModuleVisible, isToolVisible, setTrackVisible, setModuleVisible, setToolVisible])}
    >
      {children}
    </VisibilityContext.Provider>
  );
}

// ─── Hook ───

export function useVisibility() {
  const context = useContext(VisibilityContext);
  if (!context) {
    throw new Error('useVisibility must be used within a VisibilityProvider');
  }
  return context;
}
