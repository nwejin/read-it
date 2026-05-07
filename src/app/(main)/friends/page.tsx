'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFollowing, useUnfollowMutation, useMarkFriendsRead, useDismissRemovedFriend } from '@/hooks/useFriends'
import Image from 'next/image'
import { Link2, Users, X, ChevronRight } from 'lucide-react'
import { FriendItemSkeleton } from '@/components/Skeletons'
import { FriendEntry } from '@/types'

export default function FriendsPage() {
  const router = useRouter()
  const [linkCopied, setLinkCopied] = useState(false)
  const [confirmFriend, setConfirmFriend] = useState<FriendEntry | null>(null)
  const { data: friends = [], isLoading } = useFollowing()
  const unfollow = useUnfollowMutation()
  const dismiss = useDismissRemovedFriend()
  const markRead = useMarkFriendsRead()

  const activeFriends = friends.filter(f => f.status === 'active')
  const removedFriends = friends.filter(f => f.status === 'removed')

  useEffect(() => {
    markRead.mutate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleShareLink() {
    const supabase = (await import('@/lib/supabase/client')).createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('user_code')
      .eq('id', user.id)
      .single()
    if (!data?.user_code) return
    const link = `${window.location.origin}/invite/${data.user_code}`
    await navigator.clipboard.writeText(link)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  async function handleConfirmUnfollow() {
    if (!confirmFriend) return
    await unfollow.mutateAsync(confirmFriend.following_id)
    setConfirmFriend(null)
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-14">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#111] tracking-tight">친구</h1>
        <button
          onClick={handleShareLink}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111] text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform"
        >
          <Link2 className="w-4 h-4" strokeWidth={2.5} />
          {linkCopied ? '복사됨 ✓' : '초대 링크 복사'}
        </button>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="divide-y divide-[#F0F0F0]">
          {Array.from({ length: 3 }).map((_, i) => <FriendItemSkeleton key={i} />)}
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && friends.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 text-[#ccc]">
          <Users className="w-12 h-12 mb-4" strokeWidth={1.5} />
          <p className="text-base font-semibold text-[#aaa] mb-1">아직 친구가 없어요</p>
          <p className="text-sm text-[#ccc] mb-8">초대 링크를 공유해서 친구를 추가해보세요</p>
          <button
            onClick={handleShareLink}
            className="flex items-center gap-2 px-5 py-3 bg-[#111] text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform"
          >
            <Link2 className="w-4 h-4" strokeWidth={2.5} />
            {linkCopied ? '복사됨 ✓' : '초대 링크 복사'}
          </button>
        </div>
      )}

      {!isLoading && friends.length > 0 && (
        <div className="divide-y divide-[#F0F0F0]">
          {/* 활성 친구 목록 */}
          {activeFriends.map((friend) => (
            <div key={friend.id} className="flex items-center gap-4 py-4">
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
                <ChevronRight className="w-4 h-4 text-[#ddd] shrink-0" strokeWidth={2} />
              </button>

              <button
                onClick={() => setConfirmFriend(friend)}
                className="shrink-0 text-[#ccc] p-1 active:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          ))}

          {/* 삭제 알림 카드 */}
          {removedFriends.map((friend) => (
            <div key={friend.id} className="py-4">
              <div className="flex items-center gap-4 opacity-40">
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
              </div>
              <div className="flex items-center justify-between mt-2 pl-15">
                <p className="text-xs text-[#aaa]">이 친구가 나를 삭제했어요</p>
                <button
                  onClick={() => dismiss.mutate(friend.id)}
                  disabled={dismiss.isPending}
                  className="text-xs text-[#888] border border-[#E0E0E0] rounded-lg px-2.5 py-1 active:scale-95 transition-transform disabled:opacity-40"
                >
                  확인
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 친구 삭제 확인 모달 */}
      {confirmFriend && (
        <div
          className="fixed inset-0 z-modal-overlay flex items-end bg-black/30 backdrop-blur-[2px]"
          onClick={() => setConfirmFriend(null)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-white rounded-t-3xl px-5 pt-3 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-6">
              <div className="w-10 h-1 bg-[#E0E0E0] rounded-full" />
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-10 h-10 rounded-full bg-[#111] overflow-hidden flex items-center justify-center shrink-0">
                {confirmFriend.following.avatar_url ? (
                  <Image src={confirmFriend.following.avatar_url} alt={confirmFriend.following.nickname} fill className="object-cover" sizes="40px" />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {confirmFriend.following.nickname.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-base font-semibold text-[#111]">{confirmFriend.following.nickname}</p>
                <p className="text-xs text-[#aaa] font-mono">{confirmFriend.following.user_code}</p>
              </div>
            </div>

            <p className="text-xl font-bold text-[#111] mt-5 mb-1">친구를 삭제하시겠어요?</p>
            <p className="text-sm text-[#aaa] mb-8">삭제하면 양쪽 모두 친구 목록에서 사라져요</p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmFriend(null)}
                className="flex-1 py-4 bg-[#F7F7F7] text-[#888] text-base font-medium rounded-xl active:scale-95 transition-transform"
              >
                취소
              </button>
              <button
                onClick={handleConfirmUnfollow}
                disabled={unfollow.isPending}
                className="flex-1 py-4 bg-red-500 text-white text-base font-semibold rounded-xl active:scale-95 transition-transform disabled:opacity-40"
              >
                {unfollow.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
