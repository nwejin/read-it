'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AladinBook, ReadStatus } from '@/types'
import { useUserBooks } from '@/hooks/useUserBooks'
import BookCard from '@/components/BookCard'
import BookStatusModal from '@/components/BookStatusModal'

async function fetchBooks(query: string): Promise<AladinBook[]> {
  const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`)
  const data = await res.json()

  const seen = new Set<string>()
  return (data.books ?? []).filter((b: AladinBook) => {
    if (!b.isbn13 || seen.has(b.isbn13)) return false
    seen.add(b.isbn13)
    return true
  })
}

async function fetchBestsellers(): Promise<AladinBook[]> {
  const res = await fetch('/api/books/bestseller')
  const data = await res.json()
  return data.books ?? []
}

export default function SearchPage() {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [selectedBook, setSelectedBook] = useState<AladinBook | null>(null)

  const isSearching = query.trim().length > 0

  const { data: searchResults = [], isFetching: isSearchFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchBooks(query),
    enabled: isSearching,
    staleTime: 1000 * 60 * 5,
  })

  const { data: bestsellers = [], isFetching: isBestsellerFetching } = useQuery({
    queryKey: ['bestsellers'],
    queryFn: fetchBestsellers,
    enabled: !isSearching,
    staleTime: 1000 * 60 * 60,
  })

  const books = isSearching ? searchResults : bestsellers
  const isFetching = isSearching ? isSearchFetching : isBestsellerFetching
  const isbn13s = books.map((b) => b.isbn13)

  const { userBooks, upsertUserBook, isPending } = useUserBooks(isbn13s)

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (input.trim()) setQuery(input.trim())
  }

  function handleClear() {
    setInput('')
    setQuery('')
  }

  async function handleSaveStatus(isOwned: boolean, readStatus: ReadStatus | null, rating: number | null) {
    if (!selectedBook) return
    await upsertUserBook({ book: selectedBook, isOwned, readStatus, rating })
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-10 px-5 pt-14 pb-4 border-b border-[#F0F0F0]">
        <h1 className="text-3xl font-bold text-[#111] tracking-tight mb-4">읽었나?</h1>
        <form onSubmit={handleSearch} className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="책 제목, 저자 검색"
            className="w-full pl-10 pr-10 py-3 bg-[#F7F7F7] rounded-xl text-base text-[#111] placeholder-[#aaa] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#111] transition-all"
          />
          {input && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </form>
      </div>

      {/* 섹션 타이틀 */}
      <div className="px-5 pt-5 pb-1">
        {!isSearching && (
          <p className="text-sm font-semibold text-[#888] uppercase tracking-widest">
            이번 주 베스트셀러
          </p>
        )}
        {isSearching && !isFetching && searchResults.length > 0 && (
          <p className="text-sm font-semibold text-[#888] uppercase tracking-widest">
            검색 결과 {searchResults.length}건
          </p>
        )}
      </div>

      {/* 목록 */}
      <div className="px-5">
        {isFetching && (
          <div className="flex justify-center py-20 text-[#888] text-base">불러오는 중...</div>
        )}

        {!isFetching && isSearching && searchResults.length === 0 && (
          <div className="flex justify-center py-20 text-[#888] text-base">검색 결과가 없어요.</div>
        )}

        {!isFetching && books.length > 0 && (
          <div className="divide-y divide-[#F0F0F0]">
            {books.map((book, index) => (
              <div key={book.isbn13} className="relative">
                {!isSearching && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-bold text-[#ddd] w-5 text-center">
                    {index + 1}
                  </span>
                )}
                <div className={!isSearching ? 'pl-6' : ''}>
                  <BookCard
                    book={book}
                    userBook={userBooks[book.isbn13]}
                    onClick={() => setSelectedBook(book)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBook && (
        <BookStatusModal
          book={selectedBook}
          userBook={userBooks[selectedBook.isbn13]}
          onSave={handleSaveStatus}
          onClose={() => setSelectedBook(null)}
          saving={isPending}
        />
      )}
    </div>
  )
}
