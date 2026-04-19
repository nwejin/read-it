'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import gsap from 'gsap'
import { createClient } from '@/lib/supabase/client'
import { AladinBook, ReadStatus, UserBook } from '@/types'
import BookStatusModal from '@/components/BookStatusModal'
import { useUserBooks } from '@/hooks/useUserBooks'

type Tab = 'owned' | 'read' | 'reading' | 'want_to_read'

interface LibraryItem {
  userBook: UserBook
  book: {
    isbn13: string
    title: string
    author: string | null
    cover: string | null
    publisher: string | null
    pub_date: string | null
    aladin_url: string | null
  }
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'owned', label: '보유' },
  { key: 'read', label: '읽었어요' },
  { key: 'reading', label: '읽는 중' },
  { key: 'want_to_read', label: '읽고 싶어요' },
]

function toAladinBook(item: LibraryItem): AladinBook {
  return {
    isbn13: item.book.isbn13,
    title: item.book.title,
    author: item.book.author ?? '',
    cover: item.book.cover ?? '',
    publisher: item.book.publisher ?? '',
    pubDate: item.book.pub_date ?? '',
    description: '',
    link: item.book.aladin_url ?? '',
  }
}

async function fetchLibrary(tab: Tab): Promise<LibraryItem[]> {
  const supabase = createClient()
  let query = supabase
    .from('user_books')
    .select('*, book:books(*)')
    .order('updated_at', { ascending: false })

  if (tab === 'owned') {
    query = query.eq('is_owned', true)
  } else {
    query = query.eq('read_status', tab)
  }

  const { data } = await query
  return (data ?? []).map((d) => ({ userBook: d as UserBook, book: d.book }))
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('owned')
  const [selectedBook, setSelectedBook] = useState<AladinBook | null>(null)
  const [selectedUserBook, setSelectedUserBook] = useState<UserBook | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { data: items = [], isFetching } = useQuery({
    queryKey: ['library', activeTab],
    queryFn: () => fetchLibrary(activeTab),
    staleTime: 1000 * 60 * 2,
  })

  useEffect(() => {
    if (!isFetching && listRef.current) {
      const cards = listRef.current.querySelectorAll('.book-item')
      gsap.set(listRef.current, { opacity: 1, y: 0 })
      gsap.fromTo(cards,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      )
    }
  }, [isFetching, items])

  const { upsertUserBook, isPending } = useUserBooks([])

  function handleTabChange(tab: Tab) {
    if (tab === activeTab) return
    gsap.to(listRef.current, {
      opacity: 0, y: 6, duration: 0.15, ease: 'power2.in',
      onComplete: () => setActiveTab(tab),
    })
  }

  async function handleSaveStatus(isOwned: boolean, readStatus: ReadStatus | null) {
    if (!selectedBook) return
    await upsertUserBook({ book: selectedBook, isOwned, readStatus })
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-10 px-5 pt-14 pb-0 border-b border-[#F0F0F0]">
        <h1 className="text-3xl font-bold text-[#111] tracking-tight mb-4">내 서재</h1>

        {/* 탭 — 언더라인 스타일 */}
        <div className="flex gap-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`shrink-0 pb-3 text-base font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'text-[#111] border-[#111]'
                  : 'text-[#bbb] border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      <div ref={listRef} className="px-5 pt-1">
        {isFetching && (
          <div className="flex justify-center py-20 text-[#888] text-base">불러오는 중...</div>
        )}

        {!isFetching && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-[#ccc]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-4" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <p className="text-base text-[#aaa]">아직 추가한 책이 없어요</p>
          </div>
        )}

        {!isFetching && items.length > 0 && (
          <div className="divide-y divide-[#F0F0F0]">
            {items.map((item) => (
              <button
                key={item.userBook.id}
                onClick={() => {
                  setSelectedBook(toAladinBook(item))
                  setSelectedUserBook(item.userBook)
                }}
                className="book-item w-full flex gap-4 py-5 text-left transition-all active:scale-[0.98] active:bg-[#FAFAFA]"
              >
                <div className="relative w-12 h-17 shrink-0 bg-[#F0F0F0] rounded-md overflow-hidden">
                  {item.book.cover ? (
                    <Image
                      src={item.book.cover}
                      alt={item.book.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#ccc] text-[10px]">
                      없음
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-lg font-semibold text-[#111] leading-snug line-clamp-2 mb-0.5">
                    {item.book.title}
                  </p>
                  <p className="text-sm text-[#888]">
                    {item.book.author} · {item.book.publisher}
                    {item.book.pub_date && ` · ${item.book.pub_date.slice(0, 4)}`}
                  </p>

                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {item.userBook.is_owned && (
                      <span className="px-2.5 py-0.5 bg-[#111] text-white text-sm font-medium rounded-full">
                        보유
                      </span>
                    )}
                    {item.userBook.read_status === 'read' && (
                      <span className="px-2.5 py-0.5 bg-[#F0F0F0] text-[#555] text-sm font-medium rounded-full">읽었어요</span>
                    )}
                    {item.userBook.read_status === 'reading' && (
                      <span className="px-2.5 py-0.5 bg-[#F0F0F0] text-[#555] text-sm font-medium rounded-full">읽는 중</span>
                    )}
                    {item.userBook.read_status === 'want_to_read' && (
                      <span className="px-2.5 py-0.5 bg-[#F0F0F0] text-[#555] text-sm font-medium rounded-full">읽고 싶어요</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 self-center text-[#ddd]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedBook && (
        <BookStatusModal
          book={selectedBook}
          userBook={selectedUserBook}
          onSave={handleSaveStatus}
          onClose={() => {
            setSelectedBook(null)
            setSelectedUserBook(null)
          }}
          saving={isPending}
          showDelete
        />
      )}
    </div>
  )
}
