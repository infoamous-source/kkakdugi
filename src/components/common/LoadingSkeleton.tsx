export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-kk-bg flex flex-col items-center justify-center gap-4">
      {/* 깍두기 마스코트 pulse */}
      <div className="w-16 h-16 rounded-2xl bg-kk-warm animate-pulse flex items-center justify-center">
        <span className="text-3xl">🥒</span>
      </div>
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-kk-red animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-kk-red animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-kk-red animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
