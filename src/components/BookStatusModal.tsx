'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { AladinBook, ReadStatus, UserBook } from '@/types';

interface Props {
  book: AladinBook;
  userBook?: UserBook | null;
  onSave: (isOwned: boolean, readStatus: ReadStatus | null) => Promise<void>;
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
  const [readStatus, setReadStatus] = useState<ReadStatus | null>(userBook?.read_status ?? null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

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
    await onSave(isOwned, readStatus);
    handleClose();
  }

  async function handleDelete() {
    await onSave(false, null);
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
        {/* 핸들바 */}
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
          <div className="min-w-0 flex flex-col justify-center">
            <h3 className="text-[15px] font-semibold text-[#111] leading-snug line-clamp-2">{book.title}</h3>
            <p className="text-xs text-[#888] mt-0.5">{book.author}</p>
            <p className="text-xs text-[#aaa]">{book.publisher}</p>
            <Link href={`/book/${book.isbn13}`} className="text-xs text-[#aaa] underline mt-1.5 inline-block">
              자세히 보기 →
            </Link>
          </div>
        </div>

        {/* 보유 여부 */}
        <div className="pb-5 mb-5 border-b border-[#F0F0F0]">
          <p className="text-xs font-medium text-[#888] mb-2">집에 있나요?</p>
          <button
            onClick={() => setIsOwned((v) => !v)}
            className={`w-full py-3.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97] ${
              isOwned ? 'bg-[#111] text-white' : 'bg-[#F7F7F7] text-[#555]'
            }`}>
            {isOwned ? '집에 있어요' : '집에 없어요'}
          </button>
        </div>

        {/* 읽기 상태 */}
        <div className="pb-6 mb-6 border-b border-[#F0F0F0]">
          <p className="text-xs font-medium text-[#888] mb-2">읽기 상태</p>
          <div className="flex gap-2">
            {READ_STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setReadStatus((v) => (v === opt.value ? null : opt.value))}
                className={`flex-1 py-3 rounded-xl text-xs font-medium transition-all active:scale-[0.95] ${
                  readStatus === opt.value ? 'bg-[#111] text-white' : 'bg-[#F7F7F7] text-[#555]'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-[#111] text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-40">
          {saving ? '저장 중...' : '저장하기'}
        </button>

        {/* 삭제 버튼 */}
        {showDelete && (
          <button
            onClick={handleDelete}
            disabled={saving}
            className="w-full py-3 text-sm text-[#aaa] transition-all active:scale-[0.97] disabled:opacity-40">
            서재에서 삭제
          </button>
        )}
      </div>
    </div>
  );
}
