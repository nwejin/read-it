'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LibraryView from '@/components/LibraryView'

export default function FriendLibraryPage() {
  const { userId } = useParams<{ userId: string }>()
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        setNickname(data?.nickname ?? '')
        setLoading(false)
      })
  }, [userId])

  if (loading) return null

  return <LibraryView userId={userId} isOwner={false} nickname={nickname} />
}
