'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { UserBook, ReadStatus, AladinBook } from '@/types'

export function useUserBooks(isbn13s: string[]) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: userBooks = {} } = useQuery<Record<string, UserBook>>({
    queryKey: ['userBooks', isbn13s],
    queryFn: async () => {
      if (isbn13s.length === 0) return {}
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return {}
      const { data } = await supabase
        .from('user_books')
        .select('*')
        .eq('user_id', user.id)
        .in('isbn13', isbn13s)

      const map: Record<string, UserBook> = {}
      data?.forEach((ub) => { map[ub.isbn13] = ub })
      return map
    },
    enabled: isbn13s.length > 0,
  })

  const { mutateAsync: upsertUserBook, isPending } = useMutation({
    mutationFn: async ({
      book,
      isOwned,
      readStatus,
      rating,
    }: {
      book: AladinBook
      isOwned: boolean
      readStatus: ReadStatus | null
      rating: number | null
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요해요.')

      const { error: bookError } = await supabase.from('books').upsert({
        isbn13: book.isbn13,
        title: book.title,
        author: book.author,
        cover: book.cover,
        publisher: book.publisher,
        pub_date: book.pubDate,
        description: book.description,
        aladin_url: book.link,
      }, { onConflict: 'isbn13' })

      if (bookError) throw bookError

      if (!isOwned && !readStatus) {
        await supabase
          .from('user_books')
          .delete()
          .eq('user_id', user.id)
          .eq('isbn13', book.isbn13)
        return null
      }

      const { data, error: userBookError } = await supabase
        .from('user_books')
        .upsert({
          user_id: user.id,
          isbn13: book.isbn13,
          is_owned: isOwned,
          read_status: readStatus,
          rating: readStatus === 'read' ? rating : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,isbn13' })
        .select()
        .single()

      if (userBookError) throw userBookError
      return data as UserBook
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBooks'] })
      queryClient.invalidateQueries({ queryKey: ['library'] })
    },
  })

  return { userBooks, upsertUserBook, isPending }
}
