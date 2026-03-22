import { lazy, Suspense, Component, ReactNode } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import SchoolBottomNav from '../../../components/school/SchoolBottomNav';
import KkakdugiMascot from '../../../components/brand/KkakdugiMascot';

/* ------------------------------------------------------------------ */
/*  Lazy-load wrapper with automatic reload on chunk-load failure      */
/* ------------------------------------------------------------------ */

const CHUNK_RELOAD_KEY = 'chunk-reload';

function lazyWithRetry(
  factory: () => Promise<{ default: React.ComponentType }>,
) {
  return lazy(() =>
    factory().catch(() => {
      // First failure → reload to pick up new deployment assets
      if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
        window.location.reload();
      }
      // Already tried once → re-throw so ErrorBoundary can show UI
      return factory();
    }),
  );
}

/* ------------------------------------------------------------------ */
/*  Error boundary – catches chunk failures that slip past lazy retry  */
/* ------------------------------------------------------------------ */

interface EBProps {
  children: ReactNode;
}
interface EBState {
  hasError: boolean;
}

class ChunkErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): EBState {
    return { hasError: true };
  }

  componentDidMount() {
    // If we reach this point the page rendered successfully → clear flag
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  }

  componentDidUpdate(_prev: EBProps, prevState: EBState) {
    if (prevState.hasError && !this.state.hasError) {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow p-8 text-center max-w-sm w-full">
            <p className="text-kk-brown font-semibold text-lg">
              페이지를 불러올 수 없습니다
            </p>
            <p className="text-kk-brown/60 text-sm mt-2 mb-6">
              새 버전이 배포되었을 수 있어요. 새로고침해 주세요.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-kk-red text-white font-bold rounded-xl hover:bg-kk-red-deep transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/*  Lazy tool imports (with retry)                                     */
/* ------------------------------------------------------------------ */

const AptitudeTestTool = lazyWithRetry(() => import('./tools/AptitudeTestTool'));
const MarketScannerTool = lazyWithRetry(() => import('./tools/MarketScannerTool'));
const EdgeMakerTool = lazyWithRetry(() => import('./tools/EdgeMakerTool'));
const ViralCardMakerTool = lazyWithRetry(() => import('./tools/ViralCardMakerTool'));
const PerfectPlannerTool = lazyWithRetry(() => import('./tools/PerfectPlannerTool'));
const ROASSimulatorTool = lazyWithRetry(() => import('./tools/ROASSimulatorTool'));

const toolComponents: Record<string, React.ComponentType> = {
  'aptitude-test': AptitudeTestTool,
  'market-scanner': MarketScannerTool,
  'edge-maker': EdgeMakerTool,
  'viral-card-maker': ViralCardMakerTool,
  'perfect-planner': PerfectPlannerTool,
  'roas-simulator': ROASSimulatorTool,
};

export default function SchoolToolRouter() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-kk-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-kk-red" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-kk-bg flex flex-col items-center justify-center p-6">
        <KkakdugiMascot size={48} />
        <p className="mt-4 text-kk-brown font-semibold text-lg">로그인이 필요합니다</p>
        <p className="text-kk-brown/60 text-sm mt-1 mb-6">마케팅 학교는 학생 등록 후 이용할 수 있어요</p>
        <button
          onClick={() => navigate('/login', { state: { redirectTo: '/marketing/hub' } })}
          className="px-6 py-3 bg-kk-red text-white font-bold rounded-xl hover:bg-kk-red-deep transition-colors"
        >
          로그인하기
        </button>
      </div>
    );
  }

  if (!toolId || !toolComponents[toolId]) {
    return <Navigate to="/marketing/school/lab" replace />;
  }

  const ToolComponent = toolComponents[toolId];
  return (
    <div className="pb-20">
      <ChunkErrorBoundary>
        <Suspense fallback={
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin h-8 w-8 border-4 border-kk-red border-t-transparent rounded-full" />
          </div>
        }>
          <ToolComponent />
        </Suspense>
      </ChunkErrorBoundary>
      <SchoolBottomNav />
    </div>
  );
}
