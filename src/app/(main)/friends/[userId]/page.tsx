'use client'

import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import LibraryView from '@/components/LibraryView'
import { LibrarySkeleton } from '@/components/Skeletons'
import ErrorPage from '@/components/ErrorPage'
import { AlertCircle } from 'lucide-react'

export default function FriendLibraryPage() {
  const { userId } = useParams<{ userId: string }>()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', userId)
        .single()
      return data
    },
  })

  if (isLoading) return <LibrarySkeleton />
  if (isError) return <ErrorPage icon={AlertCircle} title="불러오지 못했어요" description="잠시 후 다시 시도해 주세요." action={{ label: '다시 시도', onClick: () => refetch() }} />
  if (!data) notFound()

  return <LibraryView userId={userId} isOwner={false} nickname={data.nickname} />
}
