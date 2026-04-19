'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      setEmail(session.user.email ?? '')
      setNickname(session.user.user_metadata?.nickname ?? '')
    })
  }, [])

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-14">
      <h1 className="text-2xl font-bold text-[#111] tracking-tight mb-8">프로필</h1>

      <div className="mb-6">
        <div className="py-4 border-b border-[#F0F0F0]">
          <p className="text-xs text-[#aaa] mb-1">닉네임</p>
          <p className="text-sm font-medium text-[#111]">{nickname || '-'}</p>
        </div>
        <div className="py-4 border-b border-[#F0F0F0]">
          <p className="text-xs text-[#aaa] mb-1">이메일</p>
          <p className="text-sm font-medium text-[#111]">{email || '-'}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full py-4 bg-[#F7F7F7] text-[#888] text-sm font-medium rounded-xl disabled:opacity-40"
      >
        {loading ? '로그아웃 중...' : '로그아웃'}
      </button>
    </div>
  )
}
