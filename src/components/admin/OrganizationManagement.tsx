import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Users, Building2, Copy, Check, RefreshCw, X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  createOrganization,
  getOrganizations,
  deleteOrganization,
  getOrgStudentCount,
  type OrganizationRow,
} from '../../services/organizationService';
import { SCHOOL_IDS, SCHOOL_NAMES, type SchoolId } from '../../types/enrollment';

interface OrgWithCount extends OrganizationRow {
  studentCount: number;
}

export default function OrganizationManagement() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<OrgWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProgramTypes, setSelectedProgramTypes] = useState<SchoolId[]>(['marketing']);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    const orgList = await getOrganizations(user.id);
    const withCounts = await Promise.all(
      orgList.map(async (org) => ({
        ...org,
        studentCount: await getOrgStudentCount(org.code),
      })),
    );
    setOrgs(withCounts);
    setIsLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggleProgramType = (schoolId: SchoolId) => {
    setSelectedProgramTypes(prev =>
      prev.includes(schoolId)
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId],
    );
  };

  const handleCreate = async () => {
    if (!user?.id || !newOrgName.trim() || selectedProgramTypes.length === 0) return;
    setIsCreating(true);
    const result = await createOrganization(user.id, newOrgName.trim(), selectedProgramTypes);
    if (result) {
      setShowCreateModal(false);
      setNewOrgName('');
      setSelectedProgramTypes(['marketing']);
      await loadData();
    } else {
      alert('기관 생성에 실패했습니다. 다시 시도해주세요.');
    }
    setIsCreating(false);
  };

  const handleDelete = async (orgId: string, orgName: string) => {
    if (!confirm(`"${orgName}" 기관을 삭제하시겠습니까?`)) return;
    const success = await deleteOrganization(orgId);
    if (success) {
      setOrgs(prev => prev.filter(o => o.id !== orgId));
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
            <Building2 className="w-5 h-5 text-purple-600" />
            기관 관리
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">기관 생성</span>
              <span className="sm:hidden">생성</span>
            </button>
          </div>
        </div>

        {/* 기관 목록 */}
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin mx-auto mb-2" />
            <p className="text-gray-400 text-sm">불러오는 중...</p>
          </div>
        ) : orgs.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">아직 생성된 기관이 없습니다.</p>
            <p className="text-gray-400 text-xs mt-1">
              "기관 생성" 버튼으로 첫 기관을 만들어보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {orgs.map(org => (
              <div
                key={org.id}
                className="relative bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                {/* 삭제 버튼 */}
                <button
                  onClick={() => handleDelete(org.id, org.name)}
                  className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* 기관명 */}
                <h4 className="font-semibold text-gray-800 text-sm mb-2 pr-8">{org.name}</h4>

                {/* 코드 */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-mono text-sm font-bold text-purple-700 tracking-wider">
                    {org.code}
                  </span>
                  <button
                    onClick={() => handleCopyCode(org.code)}
                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="코드 복사"
                  >
                    {copiedCode === org.code ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* 프로그램 유형 */}
                {org.program_types && org.program_types.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {org.program_types.map(pt => (
                      <span
                        key={pt}
                        className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium"
                      >
                        {SCHOOL_NAMES[pt]?.ko || pt}
                      </span>
                    ))}
                  </div>
                )}

                {/* 학생 수 + 생성일 */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {org.studentCount}명
                  </span>
                  <span>
                    {new Date(org.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 워크플로우 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5">
        <h4 className="font-semibold text-blue-800 text-sm mb-3">📋 수업 진행 순서</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { step: 1, label: '기관 생성', desc: '코드 자동 생성' },
            { step: 2, label: '코드 배포', desc: '학생에게 코드 전달' },
            { step: 3, label: '학생 가입', desc: '코드로 가입' },
            { step: 4, label: '교실/팀 배정', desc: '팀 관리 탭에서' },
          ].map(({ step, label, desc }) => (
            <div key={step} className="flex items-center gap-2 p-2 bg-white rounded-lg">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {step}
              </div>
              <div>
                <p className="text-xs font-medium text-blue-800">{label}</p>
                <p className="text-[10px] text-blue-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">기관 생성</h3>
              <button
                onClick={() => { setShowCreateModal(false); setNewOrgName(''); }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 font-medium mb-1 block">기관명</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={e => setNewOrgName(e.target.value)}
                  placeholder="예: 서울다문화센터, ABC학원"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              {/* 프로그램 유형 선택 */}
              <div>
                <label className="text-sm text-gray-600 font-medium mb-2 block">프로그램 유형</label>
                <div className="space-y-2">
                  {SCHOOL_IDS.map(schoolId => (
                    <label
                      key={schoolId}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        selectedProgramTypes.includes(schoolId)
                          ? 'border-purple-400 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProgramTypes.includes(schoolId)}
                        onChange={() => handleToggleProgramType(schoolId)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {SCHOOL_NAMES[schoolId].ko}
                      </span>
                      <span className="text-xs text-gray-400">({schoolId})</span>
                    </label>
                  ))}
                </div>
                {selectedProgramTypes.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">최소 1개 이상의 프로그램을 선택해주세요.</p>
                )}
              </div>

              <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
                💡 기관코드는 자동으로 생성됩니다. 생성된 코드를 학생에게 전달해주세요.
              </p>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { setShowCreateModal(false); setNewOrgName(''); }}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={!newOrgName.trim() || isCreating || selectedProgramTypes.length === 0}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? '생성 중...' : '생성'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
