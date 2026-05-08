'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import LibraryView from '@/components/LibraryView'
import { LibrarySkeleton } from '@/components/Skeletons'

export default function LibraryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single()
      return {
        userId: user.id,
        nickname: profile?.nickname ?? user.user_metadata?.nickname ?? '',
      }
    },
  })

  if (isLoading) return <LibrarySkeleton />
  if (!data) return null

  return <LibraryView userId={data.userId} isOwner={true} nickname={data.nickname} />
}
