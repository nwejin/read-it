'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { FriendEntry, Profile } from '@/types'

async function fetchFollowing(): Promise<FriendEntry[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('friendships')
    .select('id, following_id, created_at, following:profiles!following_id(id, nickname, user_code, created_at)')
    .order('created_at', { ascending: false })
  return (data ?? []) as unknown as FriendEntry[]
}

async function fetchUserByCode(code: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, nickname, user_code, created_at')
    .eq('user_code', code)
    .single()
  return data ?? null
}

export function useFollowing() {
  return useQuery({
    queryKey: ['following'],
    queryFn: fetchFollowing,
    staleTime: 1000 * 60 * 5,
  })
}

export function useSearchByCode(code: string) {
  return useQuery({
    queryKey: ['userByCode', code],
    queryFn: () => fetchUserByCode(code),
    enabled: code.length === 6,
    staleTime: 1000 * 30,
    retry: false,
  })
}

export function useFollowMutations() {
  const queryClient = useQueryClient()

  const follow = useMutation({
    mutationFn: async (targetUserId: string) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요해요.')
      const { error } = await supabase.from('friendships').insert({
        follower_id: user.id,
        following_id: targetUserId,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['following'] }),
  })

  const unfollow = useMutation({
    mutationFn: async (targetUserId: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('following_id', targetUserId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['following'] }),
  })

  return { follow, unfollow }
}
