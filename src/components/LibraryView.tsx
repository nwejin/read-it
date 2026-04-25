'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import gsap from 'gsap'
import { createClient } from '@/lib/supabase/client'
import { AladinBook, ReadStatus, UserBook } from '@/types'
import BookStatusModal from '@/components/BookStatusModal'
import { useUserBooks } from '@/hooks/useUserBooks'

type Tab = 'owned' | 'not_owned' | 'read' | 'reading' | 'want_to_read'

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

interface StatsData {
  total: number
  owned: number
  notOwned: number
  read: number
  reading: number
  wantToRead: number
  avgRating: number | null
  ratingDist: number[]
}

interface LibraryViewProps {
  userId: string
  isOwner: boolean
  nickname: string
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'owned', label: '보유' },
  { key: 'not_owned', label: '미보유' },
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

async function fetchLibrary(tab: Tab, userId: string): Promise<LibraryItem[]> {
  const supabase = createClient()
  let query = supabase
    .from('user_books')
    .select('*, book:books(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (tab === 'owned') {
    query = query.eq('is_owned', true)
  } else if (tab === 'not_owned') {
    query = query.eq('is_owned', false)
  } else {
    query = query.eq('read_status', tab)
  }

  const { data } = await query
  return (data ?? []).map((d) => ({ userBook: d as UserBook, book: d.book }))
}

async function fetchStats(userId: string): Promise<StatsData> {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_books')
    .select('is_owned, read_status, rating')
    .eq('user_id', userId)
  const rows = data ?? []

  const rated = rows.filter((r) => r.rating !== null)
  const avgRating = rated.length > 0
    ? rated.reduce((sum, r) => sum + r.rating, 0) / rated.length
    : null

  return {
    total: rows.length,
    owned: rows.filter((r) => r.is_owned).length,
    notOwned: rows.filter((r) => !r.is_owned).length,
    read: rows.filter((r) => r.read_status === 'read').length,
    reading: rows.filter((r) => r.read_status === 'reading').length,
    wantToRead: rows.filter((r) => r.read_status === 'want_to_read').length,
    avgRating,
    ratingDist: [5, 4, 3, 2, 1].map((s) => rows.filter((r) => r.rating === s).length),
  }
}

export default function LibraryView({ userId, isOwner, nickname }: LibraryViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('owned')
  const [showStats, setShowStats] = useState(false)
  const [selectedBook, setSelectedBook] = useState<AladinBook | null>(null)
  const [selectedUserBook, setSelectedUserBook] = useState<UserBook | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const tabBarRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const { data: items = [], isFetching } = useQuery({
    queryKey: ['library', activeTab, userId],
    queryFn: () => fetchLibrary(activeTab, userId),
    staleTime: 1000 * 60 * 2,
    enabled: !showStats,
  })

  const { data: stats } = useQuery({
    queryKey: ['libraryStats', userId],
    queryFn: () => fetchStats(userId),
    staleTime: 1000 * 60 * 2,
    enabled: showStats,
  })

  useEffect(() => {
    if (!isFetching && listRef.current) {
      const cards = listRef.current.querySelectorAll('.book-item')
      gsap.set(listRef.current, { opacity: 1, y: 0 })
      gsap.fromTo(cards,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out', clearProps: 'transform' }
      )
    }
  }, [isFetching, items])

  useEffect(() => {
    if (!tabBarRef.current) return
    const activeBtn = tabBarRef.current.querySelector<HTMLElement>(`[data-tab="${activeTab}"]`)
    activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeTab])

  const { upsertUserBook, isPending } = useUserBooks([])

  function handleTabChange(tab: Tab) {
    if (tab === activeTab) return
    gsap.to(listRef.current, {
      opacity: 0, y: 6, duration: 0.15, ease: 'power2.in',
      onComplete: () => setActiveTab(tab),
    })
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (selectedBook) return
    if (touchStartX.current < 20 || touchStartX.current > window.innerWidth - 20) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(deltaX) < 50 || deltaY > Math.abs(deltaX)) return
    const currentIndex = TABS.findIndex((t) => t.key === activeTab)
    if (deltaX < 0 && currentIndex < TABS.length - 1) handleTabChange(TABS[currentIndex + 1].key)
    else if (deltaX > 0 && currentIndex > 0) handleTabChange(TABS[currentIndex - 1].key)
  }

  function handleBookClick(item: LibraryItem) {
    if (isOwner) {
      setSelectedBook(toAladinBook(item))
      setSelectedUserBook(item.userBook)
    } else {
      router.push(`/book/${item.book.isbn13}`)
    }
  }

  async function handleSaveStatus(isOwned: boolean, readStatus: ReadStatus | null, rating: number | null) {
    if (!selectedBook) return
    await upsertUserBook({ book: selectedBook, isOwned, readStatus, rating })
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-10 px-5 pt-14 pb-0 border-b border-[#F0F0F0]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {!isOwner && (
              <button
                onClick={() => router.back()}
                className="text-[#111] -ml-1 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-3xl font-bold text-[#111] tracking-tight">
              {nickname}의 서재
            </h1>
          </div>
          <button
            onClick={() => setShowStats((v) => !v)}
            className={`p-1.5 rounded-lg transition-colors ${showStats ? 'bg-[#111] text-white' : 'text-[#aaa]'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>

        {!showStats && (
          <div ref={tabBarRef} className="flex gap-6 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                data-tab={tab.key}
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
        )}

        {showStats && <div className="pb-3" />}
      </div>

      {/* 통계 뷰 */}
      {showStats && stats && (
        <div className="px-5 pt-6 pb-10 space-y-6">
          <div className="text-center py-6 bg-[#F7F7F7] rounded-2xl">
            <p className="text-5xl font-bold text-[#111]">{stats.total}</p>
            <p className="text-sm text-[#888] mt-1">권</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#888] uppercase tracking-widest mb-3">보유 현황</p>
            <div className="space-y-2">
              {[
                { label: '보유', value: stats.owned },
                { label: '미보유', value: stats.notOwned },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-[#555] w-16 shrink-0">{label}</span>
                  <div className="flex-1 bg-[#F0F0F0] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-[#111] rounded-full transition-all duration-500"
                      style={{ width: stats.total > 0 ? `${(value / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#111] w-8 text-right shrink-0">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#888] uppercase tracking-widest mb-3">읽기 현황</p>
            <div className="space-y-2">
              {[
                { label: '읽었어요', value: stats.read },
                { label: '읽는 중', value: stats.reading },
                { label: '읽고 싶어요', value: stats.wantToRead },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-[#555] w-20 shrink-0">{label}</span>
                  <div className="flex-1 bg-[#F0F0F0] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-[#111] rounded-full transition-all duration-500"
                      style={{ width: stats.total > 0 ? `${(value / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#111] w-8 text-right shrink-0">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {stats.avgRating !== null && (
            <div>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-sm font-semibold text-[#888] uppercase tracking-widest">별점</p>
                <p className="text-sm text-[#111] font-medium">평균 {stats.avgRating.toFixed(1)}</p>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star, i) => {
                  const count = stats.ratingDist[i]
                  const ratedTotal = stats.ratingDist.reduce((a, b) => a + b, 0)
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm text-[#555] w-6 shrink-0">{star}★</span>
                      <div className="flex-1 bg-[#F0F0F0] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-[#111] rounded-full transition-all duration-500"
                          style={{ width: ratedTotal > 0 ? `${(count / ratedTotal) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[#111] w-8 text-right shrink-0">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 목록 */}
      {!showStats && (
        <div
          ref={listRef}
          className="px-5 pt-1"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
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
                  onClick={() => handleBookClick(item)}
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
                      {item.userBook.is_owned ? (
                        <span className="px-2.5 py-0.5 bg-[#111] text-white text-sm font-medium rounded-full">보유</span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-[#F0F0F0] text-[#888] text-sm font-medium rounded-full">미보유</span>
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
                      {item.userBook.rating !== null && item.userBook.rating !== undefined && (
                        <span className="px-2.5 py-0.5 bg-[#F0F0F0] text-[#555] text-sm font-medium rounded-full">
                          {'★'.repeat(item.userBook.rating)}{'☆'.repeat(5 - item.userBook.rating)}
                        </span>
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
      )}

      {isOwner && selectedBook && (
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
