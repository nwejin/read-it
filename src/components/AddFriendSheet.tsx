'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useSearchByCode, useFollowMutations } from '@/hooks/useFriends'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onClose: () => void
}

export default function AddFriendSheet({ onClose }: Props) {
  const [code, setCode] = useState('')
  const [myId, setMyId] = useState<string | null>(null)
  const [myCode, setMyCode] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: foundUser, isFetching } = useSearchByCode(code)
  const { follow } = useFollowMutations()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setMyId(user.id)
      const { data } = await supabase
        .from('profiles')
        .select('user_code')
        .eq('id', user.id)
        .single()
      setMyCode(data?.user_code ?? null)
    })
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      gsap.fromTo(sheetRef.current, { y: '100%' }, { y: '0%', duration: 0.35, ease: 'power3.out' })
    })
    setTimeout(() => inputRef.current?.focus(), 400)
    return () => ctx.revert()
  }, [])

  function handleClose() {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 })
    gsap.to(sheetRef.current, { y: '100%', duration: 0.25, ease: 'power2.in', onComplete: onClose })
  }

  async function handleFollow() {
    if (!foundUser) return
    await follow.mutateAsync(foundUser.id)
    handleClose()
  }

  const isMyCode = myCode && code.length === 6 && code === myCode
  const isAlreadyFollowing = false // RLS가 중복 insert를 막아주므로 별도 체크 생략
  const notFound = code.length === 6 && !isFetching && !foundUser

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-[2px]"
      onClick={handleClose}
    >
      <div
        ref={sheetRef}
        className="w-full bg-white rounded-t-3xl px-5 pt-3 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-6">
          <div className="w-10 h-1 bg-[#E0E0E0] rounded-full" />
        </div>

        <h2 className="text-xl font-bold text-[#111] mb-1">친구 추가</h2>
        <p className="text-sm text-[#aaa] mb-6">친구의 6자리 코드를 입력하세요</p>

        {/* 코드 입력창 */}
        <div className="relative mb-6">
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="예: XC7836"
            className="w-full px-4 py-4 bg-[#F7F7F7] rounded-xl text-2xl font-bold font-mono text-[#111] tracking-widest text-center placeholder-[#ccc] focus:outline-none focus:ring-2 focus:ring-[#111] focus:bg-white transition-all"
            maxLength={6}
          />
          {code.length > 0 && (
            <button
              onClick={() => setCode('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ccc]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 검색 결과 */}
        {code.length === 6 && (
          <div className="mb-6 min-h-[64px]">
            {isFetching && (
              <div className="text-center text-[#aaa] text-sm py-4">검색 중...</div>
            )}
            {isMyCode && (
              <div className="text-center text-[#888] text-sm py-4">내 코드예요</div>
            )}
            {!isMyCode && notFound && (
              <div className="text-center text-[#888] text-sm py-4">없는 코드예요</div>
            )}
            {!isMyCode && !notFound && foundUser && (
              <div className="flex items-center justify-between bg-[#F7F7F7] rounded-2xl px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-white text-base font-bold shrink-0">
                    {foundUser.nickname.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[#111]">{foundUser.nickname}</p>
                    <p className="text-xs text-[#aaa] font-mono">{foundUser.user_code}</p>
                  </div>
                </div>
                <button
                  onClick={handleFollow}
                  disabled={follow.isPending}
                  className="px-4 py-2 bg-[#111] text-white text-sm font-semibold rounded-xl disabled:opacity-40 active:scale-95 transition-transform"
                >
                  {follow.isPending ? '추가 중...' : '팔로우'}
                </button>
              </div>
            )}
          </div>
        )}

        {follow.isError && (
          <p className="text-center text-sm text-red-500 mb-4">
            {(follow.error as Error)?.message?.includes('unique')
              ? '이미 팔로우 중이에요'
              : '오류가 발생했어요. 다시 시도해 주세요.'}
          </p>
        )}

        <button
          onClick={handleClose}
          className="w-full py-4 bg-[#F7F7F7] text-[#888] text-base font-medium rounded-xl"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
