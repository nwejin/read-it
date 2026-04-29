'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CHANGELOG } from '@/lib/changelog'
import WithdrawModal from '@/components/WithdrawModal'

export default function ProfilePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [userCode, setUserCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [editingNickname, setEditingNickname] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [savingNickname, setSavingNickname] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setEmail(user.email ?? '')
      const { data } = await supabase
        .from('profiles')
        .select('nickname, user_code')
        .eq('id', user.id)
        .single()
      setNickname(data?.nickname ?? user.user_metadata?.nickname ?? '')
      setUserCode(data?.user_code ?? '')
    })
  }, [])

  async function handleCopyCode() {
    if (!userCode) return
    await navigator.clipboard.writeText(userCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 카카오 공유 - 플랫폼 등록 후 활성화
  // function handleShare() {
  //   if (!userCode || !window.Kakao?.isInitialized()) return
  //   window.Kakao.Share.sendDefault({
  //     objectType: 'text',
  //     text: `${nickname}님이 친구 코드를 공유했어요!\n\n코드: ${userCode}\n\n읽었나? 앱에서 친구 추가하고 서로의 서재를 구경해봐요 :)`,
  //     link: {
  //       mobileWebUrl: window.location.origin,
  //       webUrl: window.location.origin,
  //     },
  //     buttonTitle: '읽었나? 열기',
  //   })
  // }

  async function handleSaveNickname() {
    const trimmed = nicknameInput.trim()
    if (!trimmed || trimmed === nickname) { setEditingNickname(false); return }
    setSavingNickname(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ nickname: trimmed }).eq('id', user.id)
      setNickname(trimmed)
    }
    setSavingNickname(false)
    setEditingNickname(false)
  }

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleWithdraw() {
    setWithdrawing(true)
    const res = await fetch('/api/auth/withdraw', { method: 'DELETE' })
    if (res.ok) {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } else {
      setWithdrawing(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-14">
      <h1 className="text-3xl font-bold text-[#111] tracking-tight mb-8">프로필</h1>

      <div className="mb-6">
        <div className="py-4 border-b border-[#F0F0F0]">
          <p className="text-sm text-[#aaa] mb-1">닉네임</p>
          {editingNickname ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={20}
                autoFocus
                className="flex-1 text-base font-medium text-[#111] bg-[#F7F7F7] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#111]"
              />
              <button
                onClick={handleSaveNickname}
                disabled={savingNickname}
                className="text-sm font-semibold text-[#111] disabled:opacity-40"
              >
                저장
              </button>
              <button
                onClick={() => setEditingNickname(false)}
                className="text-sm text-[#aaa]"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <p className="text-base font-medium text-[#111]">{nickname || '-'}</p>
              <button
                onClick={() => { setNicknameInput(nickname); setEditingNickname(true) }}
                className="text-xs text-[#aaa] border border-[#E0E0E0] rounded-lg px-2 py-1"
              >
                수정
              </button>
            </div>
          )}
        </div>
        <div className="py-4 border-b border-[#F0F0F0]">
          <p className="text-sm text-[#aaa] mb-1">이메일</p>
          <p className="text-base font-medium text-[#111]">{email || '-'}</p>
        </div>
        <div className="py-4 border-b border-[#F0F0F0]">
          <p className="text-sm text-[#aaa] mb-2">내 코드</p>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold text-[#111] tracking-widest font-mono">
              {userCode || '------'}
            </p>
            <button
              onClick={handleCopyCode}
              className="text-xs text-[#aaa] border border-[#E0E0E0] rounded-lg px-2 py-1 active:scale-95 transition-transform"
            >
              {copied ? '복사됨 ✓' : '복사'}
            </button>
            {/* 카카오 공유 버튼 - 플랫폼 등록 후 활성화
            <button
              onClick={handleShare}
              className="text-xs bg-[#FEE500] text-[#3C1E1E] font-semibold rounded-lg px-2 py-1 active:scale-95 transition-transform"
            >
              카카오 공유
            </button>
            */}
          </div>
          <p className="text-xs text-[#bbb] mt-2">친구에게 이 코드를 알려주세요</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full py-4 bg-[#F7F7F7] text-[#888] text-base font-medium rounded-xl disabled:opacity-40"
      >
        {loading ? '로그아웃 중...' : '로그아웃'}
      </button>

      <button
        onClick={() => setShowWithdraw(true)}
        className="w-full py-3 text-sm text-[#ccc] mt-2"
      >
        회원 탈퇴
      </button>

      {showWithdraw && (
        <WithdrawModal
          onConfirm={handleWithdraw}
          onClose={() => setShowWithdraw(false)}
          loading={withdrawing}
        />
      )}

      <div className="mt-10 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#111]">업데이트 내역</h2>
          <button
            onClick={() => router.push('/changelog')}
            className="text-sm text-[#aaa]"
          >
            전체 보기 →
          </button>
        </div>
        <div className="py-4 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-[#111]">v{CHANGELOG[0].version}</span>
            <span className="text-xs text-[#aaa]">{CHANGELOG[0].date}</span>
          </div>
          <ul className="space-y-0.5">
            {CHANGELOG[0].items.map((item) => (
              <li key={item} className="text-sm text-[#888]">• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
