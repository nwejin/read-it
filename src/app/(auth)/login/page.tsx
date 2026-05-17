'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const hasError = searchParams.get('error')

  async function handleLogin() {
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않아요.')
      setLoading(false)
      return
    }

    const redirect = searchParams.get('redirect')
    router.push(redirect ?? '/library')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#111] tracking-tight">읽었나?</h1>
        <p className="mt-1.5 text-sm text-[#888]">나만의 서재에 로그인하세요</p>
      </div>

      {hasError && (
        <p className="mb-4 text-sm text-red-500 text-center">
          카카오 로그인에 실패했어요. 다시 시도해주세요.
        </p>
      )}

      <a
        href="/api/auth/kakao/start"
        className="w-full py-4 bg-[#FEE500] text-[#191919] text-base font-semibold rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-2 mb-4"
      >
        <KakaoIcon />
        카카오 로그인
      </a>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#E8E8E8]" />
        <span className="text-xs text-[#aaa]">또는</span>
        <div className="flex-1 h-px bg-[#E8E8E8]" />
      </div>

      <form action={handleLogin} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3.5 bg-[#F7F7F7] rounded-xl text-base text-[#111] placeholder-[#aaa] focus:outline-none focus:ring-1 focus:ring-[#111] focus:bg-white transition-all"
          placeholder="이메일"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3.5 bg-[#F7F7F7] rounded-xl text-base text-[#111] placeholder-[#aaa] focus:outline-none focus:ring-1 focus:ring-[#111] focus:bg-white transition-all"
          placeholder="비밀번호"
          required
        />

        {error && <p className="text-sm text-red-500 pt-1">{error}</p>}

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#111] text-white text-base font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-40"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-base text-[#888]">
        계정이 없으신가요?{' '}
        <Link href="/register" className="font-semibold text-[#111]">
          회원가입
        </Link>
      </p>
    </div>
  )
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 0.5C4.305 0.5 0.5 3.416 0.5 7.021C0.5 9.247 1.886 11.204 4.025 12.393L3.14 15.637C3.072 15.887 3.351 16.089 3.57 15.944L7.393 13.468C7.921 13.525 8.458 13.542 9 13.542C13.695 13.542 17.5 10.626 17.5 7.021C17.5 3.416 13.695 0.5 9 0.5Z"
        fill="#191919"
      />
    </svg>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
