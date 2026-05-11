import { NextResponse } from 'next/server'

export async function GET() {
  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    client_id: process.env.KAKAO_REST_API_KEY!,
    redirect_uri: process.env.KAKAO_REDIRECT_URI!,
    response_type: 'code',
    state,
  })

  const response = NextResponse.redirect(
    `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
  )

  response.cookies.set('kakao_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
    path: '/',
    sameSite: 'lax',
  })

  return response
}
