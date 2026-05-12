import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchBestsellers } from '@/lib/aladin/api'
import HomeLanding from '@/components/HomeLanding'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/library')

  const books = await fetchBestsellers().catch(() => [])

  return <HomeLanding books={books} />
}
