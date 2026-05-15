"use client";

interface LoadingSkeletonProps {
  className?: string;
}

function SkeletonBlock({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/[0.06] ${className ?? ""}`}
      style={style}
    />
  );
}

export default function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={`w-full space-y-6 ${className ?? ""}`}>
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-6 w-64" />
            <SkeletonBlock className="h-4 w-96" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <SkeletonBlock className="h-6 w-16 rounded-full" />
          <SkeletonBlock className="h-6 w-20 rounded-full" />
          <SkeletonBlock className="h-6 w-14 rounded-full" />
          <SkeletonBlock className="h-6 w-18 rounded-full" />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-4 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-5"
          >
            <SkeletonBlock className="mb-3 h-4 w-20" />
            <SkeletonBlock className="h-8 w-16" />
            <SkeletonBlock className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6">
          <SkeletonBlock className="mb-4 h-5 w-28" />
          <div className="flex items-end gap-2" style={{ height: 200 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonBlock
                key={i}
                className="flex-1"
                style={{ height: `${30 + Math.random() * 70}%` }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6">
          <SkeletonBlock className="mb-4 h-5 w-28" />
          <div className="flex items-center justify-center" style={{ height: 200 }}>
            <SkeletonBlock className="h-44 w-44 rounded-full" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6 sm:p-8">
        <div className="mb-6 flex justify-center">
          <SkeletonBlock className="h-6 w-32" />
        </div>
        <div className="mb-8 flex justify-center">
          <SkeletonBlock className="h-44 w-44 rounded-full" />
        </div>
        <div className="mb-6 space-y-3">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
          <SkeletonBlock className="h-4 w-4/5" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.06] bg-[#111827]/80 p-4"
            >
              <div className="mb-2 flex justify-between">
                <SkeletonBlock className="h-4 w-16" />
                <SkeletonBlock className="h-4 w-10" />
              </div>
              <SkeletonBlock className="mb-3 h-1.5 w-full rounded-full" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="mt-1 h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
