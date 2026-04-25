'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LibraryView from '@/components/LibraryView'

export default function LibraryPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single()
      setNickname(data?.nickname ?? user.user_metadata?.nickname ?? '')
    })
  }, [])

  if (!userId) return null

  return <LibraryView userId={userId} isOwner={true} nickname={nickname} />
}
