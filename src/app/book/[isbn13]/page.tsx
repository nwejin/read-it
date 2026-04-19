'use client'

import { use } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { AladinBookDetail } from '@/lib/aladin/api'
import { ReadStatus } from '@/types'
import { useUserBooks } from '@/hooks/useUserBooks'
import BookStatusModal from '@/components/BookStatusModal'

async function fetchDetail(isbn13: string): Promise<AladinBookDetail> {
  const res = await fetch(`/api/books/${isbn13}`)
  const data = await res.json()
  return data.book
}

export default function BookDetailPage({ params }: { params: Promise<{ isbn13: string }> }) {
  const { isbn13 } = use(params)
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const { data: book, isLoading } = useQuery({
    queryKey: ['bookDetail', isbn13],
    queryFn: () => fetchDetail(isbn13),
    staleTime: 1000 * 60 * 60 * 24,
  })

  const { userBooks, upsertUserBook, isPending } = useUserBooks(isbn13 ? [isbn13] : [])
  const userBook = userBooks[isbn13]

  async function handleSave(isOwned: boolean, readStatus: ReadStatus | null) {
    if (!book) return
    await upsertUserBook({ book, isOwned, readStatus })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-[#888] text-base">
        불러오는 중...
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex justify-center items-center min-h-screen text-[#888] text-base">
        책을 찾을 수 없어요.
      </div>
    )
  }

  const hasStatus = userBook && (userBook.is_owned || userBook.read_status)
  const READ_STATUS_LABEL: Record<string, string> = {
    read: '읽었어요',
    reading: '읽는 중',
    want_to_read: '읽고 싶어요',
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-10 flex items-center px-5 pt-14 pb-4 border-b border-[#F0F0F0]">
        <button onClick={() => router.back()} className="mr-4 text-[#111]">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-lg font-semibold text-[#111] truncate">책 상세</span>
      </div>

      <div className="px-5 pt-7 pb-32">
        {/* 표지 + 기본 정보 */}
        <div className="flex gap-5 mb-7">
          <div className="relative w-24 h-[136px] shrink-0 bg-[#F0F0F0] rounded-lg overflow-hidden shadow-sm">
            {book.cover ? (
              <Image src={book.cover} alt={book.title} fill sizes="96px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#ccc] text-xs">없음</div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h1 className="text-xl font-bold text-[#111] leading-snug mb-1">{book.title}</h1>
            <p className="text-base text-[#555] mb-0.5">{book.author}</p>
            <p className="text-sm text-[#aaa]">{book.publisher}</p>
            {book.pubDate && <p className="text-sm text-[#aaa]">{book.pubDate.slice(0, 4)}년 출판</p>}
            {book.subInfo?.itemPage && (
              <p className="text-sm text-[#aaa]">{book.subInfo.itemPage}쪽</p>
            )}
          </div>
        </div>

        {/* 내 상태 */}
        {hasStatus && (
          <div className="flex gap-1.5 mb-6 flex-wrap">
            {userBook.is_owned && (
              <span className="px-2.5 py-1 bg-[#111] text-white text-sm font-medium rounded-full">보유</span>
            )}
            {userBook.read_status && (
              <span className="px-2.5 py-1 bg-[#F0F0F0] text-[#555] text-sm font-medium rounded-full">
                {READ_STATUS_LABEL[userBook.read_status]}
              </span>
            )}
          </div>
        )}

        {/* 카테고리 */}
        {book.categoryName && (
          <p className="text-sm text-[#aaa] mb-5">{book.categoryName}</p>
        )}

        {/* 책 소개 */}
        {(book.fullDescription || book.description) && (
          <div className="mb-6">
            <h2 className="text-base font-semibold text-[#111] mb-3">책 소개</h2>
            <p className="text-base text-[#555] leading-relaxed whitespace-pre-line">
              {book.fullDescription || book.description}
            </p>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] px-5 py-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-4 bg-[#111] text-white text-base font-semibold rounded-xl"
        >
          {hasStatus ? '상태 변경' : '내 서재에 추가'}
        </button>
      </div>

      {showModal && (
        <BookStatusModal
          book={book}
          userBook={userBook}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          saving={isPending}
          showDelete={!!hasStatus}
        />
      )}
    </div>
  )
}
