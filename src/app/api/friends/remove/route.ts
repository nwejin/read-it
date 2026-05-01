import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { targetUserId } = await request.json()

  if (!targetUserId || typeof targetUserId !== 'string') {
    return NextResponse.json({ error: 'INVALID_PARAMS' }, { status: 400 })
  }

  // A→B 행 삭제 (A의 친구 목록에서 B 제거)
  const { error: deleteError } = await adminClient
    .from('friendships')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)

  if (deleteError) {
    console.error('friends remove error:', deleteError)
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
  }

  // B→A 행을 'removed' 상태로 표시 (B의 목록에 삭제 알림 남김)
  await adminClient
    .from('friendships')
    .update({ status: 'removed' })
    .eq('follower_id', targetUserId)
    .eq('following_id', user.id)

  return NextResponse.json({ success: true })
}
