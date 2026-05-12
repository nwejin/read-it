'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { AladinBookDetail } from '@/lib/aladin/api'
import { ReadStatus } from '@/types'
import { useUserBooks } from '@/hooks/useUserBooks'
import BookStatusModal from '@/components/BookStatusModal'

const READ_STATUS_LABEL: Record<string, string> = {
  read: '읽었어요',
  reading: '읽는 중',
  want_to_read: '읽고 싶어요',
}

export default function BookDetailClient({ book }: { book: AladinBookDetail }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const { userBooks, upsertUserBook, isPending } = useUserBooks(book.isbn13 ? [book.isbn13] : [])
  const userBook = userBooks[book.isbn13]
  const hasStatus = userBook && (userBook.is_owned || userBook.read_status)

  async function handleSave(isOwned: boolean, readStatus: ReadStatus | null, rating: number | null, readAt: string | null) {
    await upsertUserBook({ book, isOwned, readStatus, rating, readAt })
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="sticky top-0 bg-white z-10 flex items-center px-5 pt-14 pb-4 border-b border-[#F0F0F0]">
        <button onClick={() => router.back()} className="mr-4 text-[#111]">
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        </button>
        <span className="text-lg font-semibold text-[#111] truncate">책 상세</span>
      </div>

      <div className="px-5 pt-7 pb-32">
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
            {userBook.read_status === 'read' && (
              <span className="px-2.5 py-1 bg-[#F0F0F0] text-sm font-medium rounded-full">
                <span className="text-amber-400">{'★'.repeat(userBook.rating ?? 0)}</span>
                <span className="text-[#E0E0E0]">{'☆'.repeat(5 - (userBook.rating ?? 0))}</span>
                {userBook.read_at && (
                  <span className="text-[#bbb] ml-1">
                    · {userBook.read_at.slice(0, 7).replace('-', '.')}
                  </span>
                )}
              </span>
            )}
          </div>
        )}

        {book.categoryName && (
          <p className="text-sm text-[#aaa] mb-5">{book.categoryName}</p>
        )}

        {(book.fullDescription || book.description) && (
          <div className="mb-6">
            <h2 className="text-base font-semibold text-[#111] mb-3">책 소개</h2>
            <p className="text-base text-[#555] leading-relaxed whitespace-pre-line">
              {book.fullDescription || book.description}
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] px-5 py-4 flex gap-3">
        {book.link && (
          <a
            href={book.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-4 py-4 bg-[#F7F7F7] text-[#555] text-sm font-semibold rounded-xl shrink-0 active:opacity-70"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={2} />
            알라딘
          </a>
        )}
        <button
          onClick={() => setShowModal(true)}
          className="flex-1 py-4 bg-[#111] text-white text-base font-semibold rounded-xl"
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
