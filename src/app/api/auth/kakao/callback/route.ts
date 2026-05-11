import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const savedState = request.cookies.get('kakao_oauth_state')?.value

  const redirectError = (msg: string) => {
    const res = NextResponse.redirect(new URL(`/login?error=${msg}`, request.url))
    res.cookies.delete('kakao_oauth_state')
    return res
  }

  if (!code || !state || state !== savedState) return redirectError('invalid_state')

  // 1. code → Kakao access token
  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_REST_API_KEY!,
      redirect_uri: process.env.KAKAO_REDIRECT_URI!,
      code,
      client_secret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  })
  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    console.error('[Kakao] token exchange failed:', tokenData)
    return redirectError('token_failed')
  }

  // 2. Kakao 사용자 정보
  const kakaoRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const kakaoUser = await kakaoRes.json()
  const kakaoId: number = kakaoUser.id
  const nickname: string =
    kakaoUser.kakao_account?.profile?.nickname ??
    kakaoUser.properties?.nickname ??
    '사용자'
  const rawImage: string | null =
    kakaoUser.kakao_account?.profile?.profile_image_url ??
    kakaoUser.properties?.profile_image ??
    null
  const profileImage = rawImage ? rawImage.replace(/^http:\/\//, 'https://') : null

  const adminClient = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 3. 기존 계정 찾기 (kakao_id로)
  let userId: string | null = null

  const { data: byKakaoId } = await adminClient
    .from('profiles')
    .select('id')
    .eq('kakao_id', kakaoId)
    .single()

  if (byKakaoId) {
    userId = byKakaoId.id
  }

  // 4. 신규 사용자 생성 (또는 기존 auth 유저 복구)
  if (!userId) {
    const syntheticEmail = `kakao_${kakaoId}@kakao.read-it.internal`

    let authUserId: string | null = null

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: syntheticEmail,
      email_confirm: true,
    })

    if (createError) {
      // 이미 auth 유저가 있으면 email로 찾기
      const { data: list } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
      const existing = list?.users.find(u => u.email === syntheticEmail)
      if (existing) {
        authUserId = existing.id
      } else {
        console.error('[Kakao] createUser failed:', createError)
        return redirectError('create_failed')
      }
    } else {
      authUserId = newUser.user?.id ?? null
    }

    if (!authUserId) return redirectError('create_failed')
    userId = authUserId

    const userCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // upsert로 프로필 생성 또는 kakao_id 업데이트
    await adminClient.from('profiles').upsert({
      id: userId,
      nickname,
      user_code: userCode,
      avatar_url: profileImage,
      kakao_id: kakaoId,
    }, { onConflict: 'id' })
  }

  // 5. auth.users에서 이메일 가져오기 (generateLink에 필요)
  const { data: authUserData } = await adminClient.auth.admin.getUserById(userId)
  const authEmail = authUserData?.user?.email
  if (!authEmail) return redirectError('no_email')

  // 6. Magic link 생성 → hashed_token 획득
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: authEmail,
  })
  if (linkError || !linkData?.properties?.hashed_token) {
    console.error('[Kakao] generateLink failed:', linkError)
    return redirectError('session_failed')
  }

  // 7. 세션 쿠키 설정 후 리다이렉트
  const response = NextResponse.redirect(new URL('/library', request.url))
  response.cookies.delete('kakao_oauth_state')

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  })
  if (verifyError) {
    console.error('[Kakao] verifyOtp failed:', verifyError)
    return redirectError('verify_failed')
  }

  return response
}
