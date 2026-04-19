'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않아요.')
      setLoading(false)
      return
    }

    router.push('/search')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#111] tracking-tight">읽었나?</h1>
        <p className="mt-1.5 text-sm text-[#888]">나만의 서재에 로그인하세요</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-3">
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
          placeholder="비밀번호"
          required
        />

        {error && <p className="text-xs text-red-500 pt-1">{error}</p>}

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#111] text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-40"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-[#888]">
        계정이 없으신가요?{' '}
        <Link href="/register" className="font-semibold text-[#111]">
          회원가입
        </Link>
      </p>
    </div>
  )
}
