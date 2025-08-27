const shimmer =
  "before:absolute before:inset-0 before:animate-[shimmer_2s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent"

// Keyframe animation for shimmer effect - smoother continuous animation
const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      transform: translateX(-150%);
    }
    100% {
      transform: translateX(150%);
    }
  }
`

function AgGridRowSkeleton() {
  return (
    <div className="grid grid-cols-10 gap-x-4 items-center border-b border-gray-200/60 bg-white hover:bg-gray-50/50 transition-colors">
      {/* Row number */}
      <div className="px-3 py-3 flex justify-center">
        <div className={`h-4 w-6 rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
      </div>

      {/* Company */}
      <div className="px-3 py-3">
        <div className={`h-4 w-full max-w-[120px] rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
      </div>

      {/* Position */}
      <div className="px-3 py-3">
        <div className={`h-4 w-full max-w-[160px] rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
      </div>

      {/* Applied Date */}
      <div className="px-3 py-3">
        <div className={`h-4 w-full max-w-[100px] rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
      </div>

      {/* Platform */}
      <div className="px-3 py-3">
        <div className={`h-4 w-full max-w-[80px] rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
      </div>

      {/* Status */}
      <div className="px-3 py-3">
        <div className={`h-4 w-full max-w-[100px] rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
      </div>

      {/* Location */}
      <div className="px-3 py-3">
        <div className={`h-4 w-full max-w-[140px] rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
      </div>

      {/* Salary */}
      <div className="px-3 py-3">
        <div className={`h-4 w-full max-w-[80px] rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
      </div>

      {/* Notes */}
      <div className="px-3 py-3">
        <div className={`h-4 w-full max-w-[200px] rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
      </div>

      {/* Link */}
      <div className="px-3 py-3">
        <div className={`h-4 w-full max-w-[60px] rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
      </div>
    </div>
  )
}

function AgGridHeaderSkeleton() {
  const headers = [
    "#",
    "Company",
    "Position",
    "Applied Date",
    "Platform",
    "Status",
    "Location",
    "Salary",
    "Notes",
    "Link",
  ]

  return (
    <div className="grid grid-cols-10 gap-x-4 items-center bg-white border-b border-gray-200 sticky top-0 z-10">
      {headers.map((title, i) => (
        <div key={i} className="px-3 py-4 text-left">
          <div className="text-xs font-medium text-gray-400">{title}</div>
        </div>
      ))}
    </div>
  )
}

export function JobGridSkeleton() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shimmerKeyframes }} />
      <div className="flex flex-col">
        <div className="shadow-xl shadow-neutral-200 rounded-b-xl w-full h-[500px] bg-white border border-gray-200 overflow-hidden">
          <div className="h-full flex flex-col bg-white rounded-b-xl">
            {/* Header */}
            <AgGridHeaderSkeleton />

            {/* Body */}
            <div className="flex-1 overflow-hidden bg-white">
              <div>
                {Array.from({ length: 10 }).map((_, i) => (
                  <AgGridRowSkeleton key={i} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-4 w-16 rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
                <div className={`h-4 w-8 rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
                <div className={`h-4 w-12 rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
                <div className={`h-8 w-8 rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
                <div className={`h-8 w-8 rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
                <div className={`h-8 w-8 rounded bg-gray-200 ${shimmer} relative overflow-hidden`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
