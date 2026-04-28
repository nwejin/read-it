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

export { BookCardSkeleton, FriendItemSkeleton }
