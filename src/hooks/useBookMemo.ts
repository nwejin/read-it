'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { BookMemo } from '@/types'

export function useBookMemo(isbn13: string) {
  const supabase = createClient()

  return useQuery<BookMemo | null>({
    queryKey: ['bookMemo', isbn13],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .from('book_memos')
        .select('*')
        .eq('user_id', user.id)
        .eq('isbn13', isbn13)
        .maybeSingle()

      return data as BookMemo | null
    },
    enabled: !!isbn13,
  })
}

export function useSaveBookMemo() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      isbn13,
      pages,
      fontSize,
      fontColor,
    }: {
      isbn13: string
      pages: string[]
      fontSize: number
      fontColor: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요해요.')

      const { data, error } = await supabase
        .from('book_memos')
        .upsert({
          user_id: user.id,
          isbn13,
          pages,
          font_size: fontSize,
          font_color: fontColor,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,isbn13' })
        .select()
        .single()

      if (error) throw error
      return data as BookMemo
    },
    onSuccess: (_, { isbn13 }) => {
      queryClient.invalidateQueries({ queryKey: ['bookMemo', isbn13] })
      queryClient.invalidateQueries({ queryKey: ['library'] })
    },
  })
}
