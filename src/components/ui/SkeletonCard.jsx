export default function SkeletonCard() {
  return (
    <div className="pcard overflow-hidden">
      {/* Square image placeholder */}
      <div className="skeleton w-full" style={{ aspectRatio: '1 / 1', borderRadius: 0 }} />
      {/* Info */}
      <div className="px-2.5 pt-2 pb-2.5 space-y-[5px]">
        <div className="skeleton h-3 w-2/5 rounded-full" />   {/* price */}
        <div className="skeleton h-2.5 w-4/5 rounded-full" /> {/* title line 1 */}
        <div className="skeleton h-2.5 w-3/5 rounded-full" /> {/* title line 2 */}
        <div className="skeleton h-2 w-3/5 rounded-full mt-1" style={{ opacity: 0.6 }} /> {/* location */}
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6, cols = 2 }) {
  return (
    <div className={`grid gap-2.5 ${cols === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

export function SkeletonHScroll({ count = 4 }) {
  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[148px]">
          <div className="skeleton w-full rounded-[14px]" style={{ aspectRatio: '1 / 1' }} />
          <div className="mt-2 space-y-[5px] px-0.5">
            <div className="skeleton h-2.5 w-2/5 rounded-full" />
            <div className="skeleton h-2 w-5/6 rounded-full" />
            <div className="skeleton h-2 w-3/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* Row skeleton for compact list views */
export function SkeletonRow({ count = 4 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 items-center p-3 rounded-[14px]"
          style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.055)' }}>
          <div className="skeleton w-14 h-14 rounded-[10px] flex-shrink-0" />
          <div className="flex-1 space-y-[5px]">
            <div className="skeleton h-2.5 w-2/5 rounded-full" />
            <div className="skeleton h-2 w-4/5 rounded-full" />
            <div className="skeleton h-2 w-3/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
