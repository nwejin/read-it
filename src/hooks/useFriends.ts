'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { FriendEntry } from '@/types'

async function fetchFollowing(): Promise<FriendEntry[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('friendships')
    .select('id, following_id, is_new, status, created_at, following:profiles!following_id(id, nickname, user_code, avatar_url, created_at)')
    .eq('follower_id', user.id)
    .order('created_at', { ascending: false })
  return (data ?? []) as unknown as FriendEntry[]
}

async function fetchNewFriendCount(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0
  const { count } = await supabase
    .from('friendships')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', user.id)
    .eq('is_new', true)
    .eq('status', 'active')
  return count ?? 0
}

export function useFollowing() {
  return useQuery({
    queryKey: ['following'],
    queryFn: fetchFollowing,
    staleTime: 1000 * 60 * 5,
  })
}

export function useNewFriendCount() {
  return useQuery({
    queryKey: ['newFriendCount'],
    queryFn: fetchNewFriendCount,
    staleTime: 0,
  })
}

export function useMarkFriendsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase
        .from('friendships')
        .update({ is_new: false })
        .eq('follower_id', user.id)
        .eq('is_new', true)
        .eq('status', 'active')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newFriendCount'] })
      queryClient.invalidateQueries({ queryKey: ['following'] })
    },
  })
}

export function useUnfollowMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const res = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      })
      if (!res.ok) throw new Error('삭제에 실패했어요.')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['following'] }),
  })
}

export function useDismissRemovedFriend() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['following'] }),
  })
}
