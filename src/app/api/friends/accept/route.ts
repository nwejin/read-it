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

  const { inviterCode } = await request.json()

  if (!inviterCode || typeof inviterCode !== 'string') {
    return NextResponse.json({ error: 'INVALID_CODE' }, { status: 400 })
  }

  const { data: inviter } = await adminClient
    .from('profiles')
    .select('id, nickname, user_code')
    .eq('user_code', inviterCode.toUpperCase())
    .single()

  if (!inviter) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  if (inviter.id === user.id) {
    return NextResponse.json({ error: 'SELF_INVITE' }, { status: 400 })
  }

  const { data: existing } = await adminClient
    .from('friendships')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', inviter.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'ALREADY_FRIENDS' }, { status: 409 })
  }

  const { error } = await adminClient.from('friendships').insert([
    { follower_id: user.id,    following_id: inviter.id, is_new: false },
    { follower_id: inviter.id, following_id: user.id,   is_new: true  },
  ])

  if (error) {
    console.error('friends accept error:', error)
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ success: true, friend: { nickname: inviter.nickname } })
}
