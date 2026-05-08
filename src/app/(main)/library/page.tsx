'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import LibraryView from '@/components/LibraryView'
import { LibrarySkeleton } from '@/components/Skeletons'
import ErrorPage from '@/components/ErrorPage'
import { AlertCircle } from 'lucide-react'

export default function LibraryPage() {
  const { data, isLoading, isError, refetch } = useQuery({
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
  if (isError) return <ErrorPage icon={AlertCircle} title="불러오지 못했어요" description="잠시 후 다시 시도해 주세요." action={{ label: '다시 시도', onClick: () => refetch() }} />
  if (!data) return null

  return <LibraryView userId={data.userId} isOwner={true} nickname={data.nickname} />
}
