'use client'

import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import LibraryView from '@/components/LibraryView'
import { LibrarySkeleton } from '@/components/Skeletons'

export default function FriendLibraryPage() {
  const { userId } = useParams<{ userId: string }>()

  const { data, isLoading } = useQuery({
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
  if (!data) notFound()

  return <LibraryView userId={userId} isOwner={false} nickname={data.nickname} />
}
