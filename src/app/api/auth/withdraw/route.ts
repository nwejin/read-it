import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 관련 데이터 먼저 삭제 (FK 제약 해제)
  await adminClient.from('user_books').delete().eq('user_id', user.id)
  await adminClient.from('friendships').delete().or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
  await adminClient.from('profiles').delete().eq('id', user.id)

  const { error } = await adminClient.auth.admin.deleteUser(user.id)

  if (error) {
    console.error('withdraw error:', error)
    return NextResponse.json({ error: '탈퇴에 실패했어요.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
