import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { Enrollment, SchoolId } from '../types/enrollment';
import { getEnrollments, submitSchoolProfile } from '../services/enrollmentService';

interface EnrollmentContextType {
  enrollments: Enrollment[];
  activeEnrollments: Enrollment[];
  pendingEnrollments: Enrollment[];
  isLoading: boolean;
  getEnrollment: (schoolId: SchoolId) => Enrollment | undefined;
  isEnrolledIn: (schoolId: SchoolId) => boolean;
  hasPendingFor: (schoolId: SchoolId) => boolean;
  submitSchoolInfo: (enrollmentId: string, schoolId: SchoolId, data: Record<string, unknown>) => Promise<boolean>;
  refreshEnrollments: () => Promise<void>;
}

const EnrollmentContext = createContext<EnrollmentContextType | null>(null);

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEnrollments = useCallback(async () => {
    if (!user) {
      setEnrollments([]);
      return;
    }
    setIsLoading(true);
    const data = await getEnrollments(user.id);
    setEnrollments(data);
    setIsLoading(false);
  }, [user]);

  // 로그인/로그아웃 시 enrollment 새로고침
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEnrollments();
    } else {
      setEnrollments([]);
    }
  }, [isAuthenticated, user, fetchEnrollments]);

  const activeEnrollments = useMemo(() => enrollments.filter((e) => e.status === 'active'), [enrollments]);
  const pendingEnrollments = useMemo(() => enrollments.filter((e) => e.status === 'pending_info'), [enrollments]);

  const getEnrollment = useCallback(
    (schoolId: SchoolId) => enrollments.find((e) => e.school_id === schoolId),
    [enrollments],
  );

  const isEnrolledIn = useCallback(
    (schoolId: SchoolId) => {
      const e = enrollments.find((en) => en.school_id === schoolId);
      return e?.status === 'active';
    },
    [enrollments],
  );

  const hasPendingFor = useCallback(
    (schoolId: SchoolId) => {
      const e = enrollments.find((en) => en.school_id === schoolId);
      return e?.status === 'pending_info';
    },
    [enrollments],
  );

  const submitSchoolInfo = useCallback(
    async (enrollmentId: string, schoolId: SchoolId, data: Record<string, unknown>) => {
      if (!user) return false;
      const success = await submitSchoolProfile(enrollmentId, user.id, schoolId, data);
      if (success) {
        await fetchEnrollments();
      }
      return success;
    },
    [user, fetchEnrollments],
  );

  return (
    <EnrollmentContext.Provider
      value={useMemo(() => ({
        enrollments,
        activeEnrollments,
        pendingEnrollments,
        isLoading,
        getEnrollment,
        isEnrolledIn,
        hasPendingFor,
        submitSchoolInfo,
        refreshEnrollments: fetchEnrollments,
      }), [enrollments, activeEnrollments, pendingEnrollments, isLoading, getEnrollment, isEnrolledIn, hasPendingFor, submitSchoolInfo, fetchEnrollments])}
    >
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollments() {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error('useEnrollments must be used within an EnrollmentProvider');
  }
  return context;
}
