'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CHANGELOG } from '@/lib/changelog'

export default function ProfilePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [userCode, setUserCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

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

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-14">
      <h1 className="text-3xl font-bold text-[#111] tracking-tight mb-8">프로필</h1>

      <div className="mb-6">
        <div className="py-4 border-b border-[#F0F0F0]">
          <p className="text-sm text-[#aaa] mb-1">닉네임</p>
          <p className="text-base font-medium text-[#111]">{nickname || '-'}</p>
        </div>
        <div className="py-4 border-b border-[#F0F0F0]">
          <p className="text-sm text-[#aaa] mb-1">이메일</p>
          <p className="text-base font-medium text-[#111]">{email || '-'}</p>
        </div>
        <div className="py-4 border-b border-[#F0F0F0]">
          <p className="text-sm text-[#aaa] mb-2">내 코드</p>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-3 active:scale-95 transition-transform"
          >
            <p className="text-2xl font-bold text-[#111] tracking-widest font-mono">
              {userCode || '------'}
            </p>
            <span className="text-xs text-[#aaa] border border-[#E0E0E0] rounded-lg px-2 py-1">
              {copied ? '복사됨 ✓' : '탭해서 복사'}
            </span>
          </button>
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

      <div className="mt-10">
        <h2 className="text-lg font-bold text-[#111] mb-4">업데이트 내역</h2>
        <div className="space-y-4">
          {CHANGELOG.map((entry) => (
            <div key={entry.version} className="py-4 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-[#111]">v{entry.version}</span>
                <span className="text-xs text-[#aaa]">{entry.date}</span>
              </div>
              <ul className="space-y-0.5">
                {entry.items.map((item) => (
                  <li key={item} className="text-sm text-[#888]">• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
