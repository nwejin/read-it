'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname } },
    })

    if (error) {
      setError('회원가입에 실패했어요. 다시 시도해 주세요.')
      setLoading(false)
      return
    }

    router.push('/search')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#111] tracking-tight">시작하기</h1>
        <p className="mt-1.5 text-sm text-[#888]">나만의 서재를 만들어보세요</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-3">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full px-4 py-3.5 bg-[#F7F7F7] rounded-xl text-sm text-[#111] placeholder-[#aaa] focus:outline-none focus:ring-1 focus:ring-[#111] focus:bg-white transition-all"
          placeholder="닉네임"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3.5 bg-[#F7F7F7] rounded-xl text-sm text-[#111] placeholder-[#aaa] focus:outline-none focus:ring-1 focus:ring-[#111] focus:bg-white transition-all"
          placeholder="이메일"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3.5 bg-[#F7F7F7] rounded-xl text-sm text-[#111] placeholder-[#aaa] focus:outline-none focus:ring-1 focus:ring-[#111] focus:bg-white transition-all"
          placeholder="비밀번호 (6자 이상)"
          required
        />

        {error && <p className="text-xs text-red-500 pt-1">{error}</p>}

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#111] text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-40"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-[#888]">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-semibold text-[#111]">
          로그인
        </Link>
      </p>
    </div>
  )
}
