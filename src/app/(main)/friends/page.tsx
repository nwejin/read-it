'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFollowing, useFollowMutations } from '@/hooks/useFriends'
import Image from 'next/image'
import AddFriendSheet from '@/components/AddFriendSheet'
import { FriendItemSkeleton } from '@/components/Skeletons'

export default function FriendsPage() {
  const router = useRouter()
  const [showAddSheet, setShowAddSheet] = useState(false)
  const { data: friends = [], isLoading } = useFollowing()
  const { unfollow } = useFollowMutations()

  return (
    <div className="max-w-lg mx-auto px-5 pt-14">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#111] tracking-tight">친구</h1>
        <button
          onClick={() => setShowAddSheet(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111] text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          추가
        </button>
      </div>

      {/* 친구 목록 */}
      {isLoading && (
        <div className="divide-y divide-[#F0F0F0]">
          {Array.from({ length: 3 }).map((_, i) => <FriendItemSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && friends.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-[#ccc]">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-4" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-base text-[#aaa] mb-1">아직 친구가 없어요</p>
          <p className="text-sm text-[#ccc]">친구 코드로 추가해보세요</p>
          <button
            onClick={() => setShowAddSheet(true)}
            className="mt-6 px-5 py-3 bg-[#111] text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform"
          >
            친구 추가하기
          </button>
        </div>
      )}

      {!isLoading && friends.length > 0 && (
        <div className="divide-y divide-[#F0F0F0]">
          {friends.map((friend) => (
            <div key={friend.id} className="flex items-center gap-4 py-4">
              {/* 아바타 */}
              <button
                onClick={() => router.push(`/friends/${friend.following_id}`)}
                className="flex-1 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
              >
                <div className="relative w-11 h-11 rounded-full bg-[#111] overflow-hidden flex items-center justify-center shrink-0">
                  {friend.following.avatar_url ? (
                    <Image src={friend.following.avatar_url} alt={friend.following.nickname} fill className="object-cover" sizes="44px" />
                  ) : (
                    <span className="text-white text-base font-bold">
                      {friend.following.nickname.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-[#111]">{friend.following.nickname}</p>
                  <p className="text-xs text-[#aaa] font-mono">{friend.following.user_code}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#ddd] shrink-0" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* 언팔로우 버튼 */}
              <button
                onClick={() => unfollow.mutate(friend.following_id)}
                disabled={unfollow.isPending}
                className="shrink-0 text-[#ccc] p-1 active:text-red-400 transition-colors disabled:opacity-40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddSheet && <AddFriendSheet onClose={() => setShowAddSheet(false)} />}
    </div>
  )
}
