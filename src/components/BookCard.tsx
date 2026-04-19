'use client'

import Image from 'next/image'
import { AladinBook, UserBook } from '@/types'

interface Props {
  book: AladinBook
  userBook?: UserBook | null
  onClick: () => void
}

const READ_STATUS_LABEL: Record<string, string> = {
  read: '읽었어요',
  reading: '읽는 중',
  want_to_read: '읽고 싶어요',
}

export default function BookCard({ book, userBook, onClick }: Props) {
  const hasAnyStatus = userBook && (userBook.is_owned || userBook.read_status)

  return (
    <button
      onClick={onClick}
      className="w-full flex gap-4 py-5 text-left transition-transform active:scale-[0.98] active:bg-[#FAFAFA]"
    >
      {/* 표지 */}
      <div className="relative w-12 h-17 shrink-0 bg-[#F0F0F0] rounded-md overflow-hidden">
        {book.cover ? (
          <Image
            src={book.cover}
            alt={book.title}
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

      {/* 정보 */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-lg font-semibold text-[#111] leading-snug line-clamp-2 mb-0.5">
          {book.title}
        </p>
        <p className="text-sm text-[#888]">
          {book.author} · {book.publisher}
          {book.pubDate && ` · ${book.pubDate.slice(0, 4)}`}
        </p>

        {/* 상태 배지 */}
        {hasAnyStatus && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {userBook.is_owned && (
              <span className="px-2.5 py-0.5 bg-[#111] text-white text-sm font-medium rounded-full">
                보유
              </span>
            )}
            {userBook.read_status && (
              <span className="px-2.5 py-0.5 bg-[#F0F0F0] text-[#555] text-sm font-medium rounded-full">
                {READ_STATUS_LABEL[userBook.read_status]}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 화살표 */}
      <div className="shrink-0 self-center text-[#ddd]">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
