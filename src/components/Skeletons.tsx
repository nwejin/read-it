function BookCardSkeleton() {
  return (
    <div className="flex gap-4 py-5 animate-pulse">
      <div className="w-12 h-[68px] shrink-0 bg-[#F0F0F0] rounded-md" />
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
        <div className="h-5 bg-[#F0F0F0] rounded w-3/4" />
        <div className="h-4 bg-[#F0F0F0] rounded w-1/2" />
        <div className="flex gap-1.5 mt-1">
          <div className="h-5 bg-[#F0F0F0] rounded-full w-12" />
          <div className="h-5 bg-[#F0F0F0] rounded-full w-16" />
        </div>
      </div>
    </div>
  )
}

function FriendItemSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 animate-pulse">
      <div className="w-11 h-11 rounded-full bg-[#F0F0F0] shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-[#F0F0F0] rounded w-24" />
        <div className="h-3 bg-[#F0F0F0] rounded w-16" />
      </div>
    </div>
  )
}

function BookDetailSkeleton() {
  return (
    <div className="max-w-lg mx-auto animate-pulse">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-10 flex items-center px-5 pt-14 pb-4 border-b border-[#F0F0F0]">
        <div className="w-5 h-5 bg-[#F0F0F0] rounded mr-4" />
        <div className="h-5 bg-[#F0F0F0] rounded w-16" />
      </div>
      {/* 본문 */}
      <div className="px-5 pt-7 pb-32">
        <div className="flex gap-5 mb-7">
          <div className="w-24 h-34 shrink-0 bg-[#F0F0F0] rounded-lg" />
          <div className="flex-1 flex flex-col justify-center gap-2.5">
            <div className="h-6 bg-[#F0F0F0] rounded w-3/4" />
            <div className="h-4 bg-[#F0F0F0] rounded w-1/2" />
            <div className="h-4 bg-[#F0F0F0] rounded w-1/3" />
          </div>
        </div>
        <div className="space-y-2.5 mt-6">
          <div className="h-4 bg-[#F0F0F0] rounded w-full" />
          <div className="h-4 bg-[#F0F0F0] rounded w-11/12" />
          <div className="h-4 bg-[#F0F0F0] rounded w-4/5" />
        </div>
      </div>
      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] px-5 py-4 flex gap-3">
        <div className="w-16 h-14 bg-[#F0F0F0] rounded-xl shrink-0" />
        <div className="flex-1 h-14 bg-[#F0F0F0] rounded-xl" />
      </div>
    </div>
  )
}

function MemoSkeleton() {
  return (
    <div className="flex-1 px-5 pt-5 pb-32 animate-pulse space-y-3">
      <div className="h-4 bg-[#F0F0F0] rounded w-full" />
      <div className="h-4 bg-[#F0F0F0] rounded w-11/12" />
      <div className="h-4 bg-[#F0F0F0] rounded w-3/4" />
      <div className="h-4 bg-[#F0F0F0] rounded w-5/6" />
      <div className="h-4 bg-[#F0F0F0] rounded w-2/3" />
    </div>
  )
}

function LibrarySkeleton() {
  return (
    <div className="max-w-lg mx-auto animate-pulse">
      {/* 헤더 */}
      <div className="px-5 pt-14 pb-4">
        <div className="h-7 bg-[#F0F0F0] rounded w-32" />
      </div>
      {/* 탭바 */}
      <div className="flex px-5 gap-3 mb-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-[#F0F0F0] rounded-full w-16" />
        ))}
      </div>
      {/* 책 목록 */}
      <div className="px-5 divide-y divide-[#F0F0F0]">
        {[...Array(4)].map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export { BookCardSkeleton, FriendItemSkeleton, BookDetailSkeleton, MemoSkeleton, LibrarySkeleton }
