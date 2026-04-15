import { X, AlertTriangle, CheckCircle2, Clock, Server, Database, Key, Cpu } from 'lucide-react';

interface DevReportProps {
  onClose: () => void;
}

interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  status: 'resolved' | 'monitoring';
}

interface Fix {
  description: string;
  commit: string;
  date: string;
}

interface PendingItem {
  item: string;
  priority: 'high' | 'medium' | 'low';
  assignee: string;
}

const incidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'Gemini API 차단 (429 Too Many Requests)',
    severity: 'critical',
    description: '수업 중 다수 학생이 동시에 AI 기능 사용 시 API rate limit 초과로 전체 차단',
    status: 'resolved',
  },
  {
    id: 'INC-002',
    title: '빈 화면 (White Screen) 발생',
    severity: 'high',
    description: 'AuthContext 초기화 실패 시 전체 앱이 빈 화면으로 렌더링',
    status: 'resolved',
  },
  {
    id: 'INC-003',
    title: 'Quota 소진 알림 미작동',
    severity: 'medium',
    description: 'API 키 잔여 quota가 부족할 때 사전 경고 없이 기능 중단',
    status: 'monitoring',
  },
];

const appliedFixes: Fix[] = [
  {
    description: 'API 요청 재시도 로직 (exponential backoff) 적용',
    commit: '70d9723',
    date: '2026-04-07',
  },
  {
    description: 'AuthContext 로딩 상태 분리 및 fallback UI 추가',
    commit: '01c0759',
    date: '2026-04-08',
  },
  {
    description: '강사 대시보드 학생 UUID 표시 → 이름/이메일 변환',
    commit: '01c0759',
    date: '2026-04-08',
  },
  {
    description: 'CEO 대시보드 5탭 통합 및 전체 학생 조회',
    commit: '70d9723',
    date: '2026-04-07',
  },
];

const pendingItems: PendingItem[] = [
  { item: 'API 키 사용량 대시보드 (실시간)', priority: 'high', assignee: 'dev-lead' },
  { item: 'Rate limit 사전 경고 알림 시스템', priority: 'high', assignee: 'dev-lead' },
  { item: 'Supabase RLS 정책 CEO 전체 조회 권한', priority: 'medium', assignee: 'dba-lead' },
  { item: '오프라인 모드 캐싱 (PWA)', priority: 'low', assignee: 'dev-lead' },
];

const severityColors = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const priorityColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

export default function DevReport({ onClose }: DevReportProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">개발 보고서</h2>
            <p className="text-sm text-gray-500 mt-1">CEO 전용 - 인시던트 및 시스템 상태</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Section 1: Incident Summary */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              인시던트 요약
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {incidents.map(inc => (
                <div
                  key={inc.id}
                  className={`rounded-xl border p-4 ${severityColors[inc.severity]}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono">{inc.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      inc.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {inc.status === 'resolved' ? '해결됨' : '모니터링 중'}
                    </span>
                  </div>
                  <p className="font-semibold text-sm mb-1">{inc.title}</p>
                  <p className="text-xs opacity-80">{inc.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Applied Fixes */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              적용된 수정
            </h3>
            <div className="space-y-3">
              {appliedFixes.map((fix, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{fix.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{fix.commit}</span>
                      <span className="ml-2">{fix.date}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Pending Items */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              미조치 사항
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">항목</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">우선순위</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">담당</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingItems.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                      <td className="px-4 py-3 text-sm text-gray-800">{item.item}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.assignee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Infrastructure Status */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-500" />
              인프라 상태
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <Key className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">Per-user</p>
                <p className="text-xs text-gray-500 mt-1">API Key 방식</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <Cpu className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">Gemini 2.0</p>
                <p className="text-xs text-gray-500 mt-1">AI 모델</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <Database className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-700">Supabase</p>
                <p className="text-xs text-gray-500 mt-1">데이터베이스</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <Server className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-700">Vercel</p>
                <p className="text-xs text-gray-500 mt-1">배포 인프라</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
