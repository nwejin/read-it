'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { Pencil } from 'lucide-react';
import { AladinBook, ReadStatus, UserBook } from '@/types';

interface Props {
  book: AladinBook;
  userBook?: UserBook | null;
  onSave: (isOwned: boolean, readStatus: ReadStatus | null, rating: number | null, readAt: string | null) => Promise<void>;
  onClose: () => void;
  saving?: boolean;
  showDelete?: boolean;
}

const READ_STATUS_OPTIONS: { value: ReadStatus; label: string }[] = [
  { value: 'read', label: '읽었어요' },
  { value: 'reading', label: '읽는 중' },
  { value: 'want_to_read', label: '읽고 싶어요' },
];

export default function BookStatusModal({
  book,
  userBook,
  onSave,
  onClose,
  saving = false,
  showDelete = false,
}: Props) {
  const [isOwned, setIsOwned] = useState(userBook?.is_owned ?? false);
  const [readStatus, setReadStatus] = useState<ReadStatus | null>(
    userBook ? (userBook.read_status ?? null) : 'want_to_read'
  );
  const [rating, setRating] = useState<number | null>(userBook?.rating ?? null);
  const [readAt, setReadAt] = useState<string>(userBook?.read_at ?? '');

  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const ownedIndex = isOwned ? 0 : 1;
  const readIndex = READ_STATUS_OPTIONS.findIndex((o) => o.value === readStatus);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(sheetRef.current, { y: '100%' }, { y: '0%', duration: 0.35, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, []);

  function handleClose() {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(sheetRef.current, {
      y: '100%',
      duration: 0.25,
      ease: 'power2.in',
      onComplete: onClose,
    });
  }

  async function handleSave() {
    await onSave(isOwned, readStatus, rating, readStatus === 'read' ? (readAt || null) : null);
    handleClose();
  }

  async function handleDelete() {
    await onSave(false, null, null, null);
    handleClose();
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-[2px]"
      onClick={handleClose}>
      <div
        ref={sheetRef}
        className="w-full bg-white rounded-t-3xl px-5 pt-3 pb-10"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 bg-[#E0E0E0] rounded-full" />
        </div>

        {/* 책 정보 */}
        <div className="flex gap-4 pb-6 mb-6 border-b border-[#F0F0F0]">
          {book.cover && (
            <div className="relative w-12 h-17 shrink-0 rounded-md overflow-hidden">
              <Image src={book.cover} alt={book.title} fill sizes="48px" className="object-cover" />
            </div>
          )}
          <div className="min-w-0 flex flex-col justify-center w-full">
            <h3 className="text-lg font-semibold text-[#111] leading-snug line-clamp-2">{book.title}</h3>
            <p className="text-sm text-[#888] mt-0.5">{book.author}</p>
            <p className="text-sm text-[#aaa]">{book.publisher}</p>
            <div className="flex items-center justify-between mt-1.5">
              <Link href={`/book/${book.isbn13}`} className="text-sm text-[#aaa] underline">
                자세히 보기 →
              </Link>
              <Link
                href={`/book/${book.isbn13}/memo`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111] text-white text-sm font-medium active:opacity-75 shrink-0">
                <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                메모
              </Link>
            </div>
          </div>
        </div>

        {/* 보유 여부 */}
        <div className="pb-5 mb-5 border-b border-[#F0F0F0]">
          <p className="text-sm font-medium text-[#888] mb-2">집에 있나요?</p>
          <div className="relative flex bg-[#F7F7F7] rounded-xl p-1">
            <div
              className="absolute top-1 bottom-1 bg-[#111] rounded-lg transition-all duration-200 ease-in-out"
              style={{
                left: `calc(4px + ${ownedIndex} * (100% - 8px) / 2)`,
                width: 'calc((100% - 8px) / 2)',
              }}
            />
            <button
              onClick={() => setIsOwned(true)}
              className={`relative z-10 flex-1 py-3.5 text-sm font-medium transition-colors duration-200 ${isOwned ? 'text-white' : 'text-[#555]'}`}>
              집에 있어요
            </button>
            <button
              onClick={() => setIsOwned(false)}
              className={`relative z-10 flex-1 py-3.5 text-sm font-medium transition-colors duration-200 ${!isOwned ? 'text-white' : 'text-[#555]'}`}>
              집에 없어요
            </button>
          </div>
        </div>

        {/* 읽기 상태 */}
        <div className="pb-6 mb-6 border-b border-[#F0F0F0]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-[#888]">읽기 상태</p>
            <div
              className={`flex items-center gap-1 transition-all duration-200 ${readStatus === 'read' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating((v) => (v === star ? null : star))}
                  className="text-xl leading-none transition-transform active:scale-90">
                  <span className={rating !== null && star <= rating ? 'text-amber-400' : 'text-[#E0E0E0]'}>★</span>
                </button>
              ))}
              <input
                type="date"
                value={readAt}
                onChange={(e) => setReadAt(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="ml-1 text-xs text-[#888] bg-[#F0F0F0] rounded-lg px-2 py-1 outline-none"
              />
            </div>
          </div>
          <div className="relative flex bg-[#F7F7F7] rounded-xl p-1">
            {readIndex >= 0 && (
              <div
                className="absolute top-1 bottom-1 bg-[#111] rounded-lg transition-all duration-200 ease-in-out"
                style={{
                  left: `calc(4px + ${readIndex} * (100% - 8px) / 3)`,
                  width: 'calc((100% - 8px) / 3)',
                }}
              />
            )}
            {READ_STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  const next = readStatus === opt.value ? null : opt.value;
                  setReadStatus(next);
                  if (next !== 'read') setRating(null);
                }}
                className={`relative z-10 flex-1 py-3 text-sm font-medium transition-colors duration-200 ${readStatus === opt.value ? 'text-white' : 'text-[#555]'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-[#111] text-white text-base font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-40">
          {saving ? '저장 중...' : '저장하기'}
        </button>

        {showDelete && (
          <button
            onClick={handleDelete}
            disabled={saving}
            className="w-full py-3 text-base text-[#aaa] transition-all active:scale-[0.97] disabled:opacity-40">
            서재에서 삭제
          </button>
        )}
      </div>
    </div>
  );
}
