'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props {
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}

export default function WithdrawModal({ onConfirm, onClose, loading }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      gsap.fromTo(sheetRef.current, { y: '100%' }, { y: '0%', duration: 0.35, ease: 'power3.out' })
    })
    return () => ctx.revert()
  }, [])

  function handleClose() {
    if (loading) return
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 })
    gsap.to(sheetRef.current, { y: '100%', duration: 0.25, ease: 'power2.in', onComplete: onClose })
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-[2px]"
      onClick={handleClose}
    >
      <div
        ref={sheetRef}
        className="w-full bg-white rounded-t-3xl px-5 pt-3 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-6">
          <div className="w-10 h-1 bg-[#E0E0E0] rounded-full" />
        </div>

        <p className="text-xl font-bold text-[#111] mb-2">정말 탈퇴하시겠어요?</p>
        <p className="text-sm text-[#888] mb-8">
          저장된 서재 정보는 삭제되어 복구가 불가능합니다.
        </p>

        <button
          onClick={onConfirm}
          disabled={loading}
          className="w-full py-4 bg-red-500 text-white text-base font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-40 mb-3"
        >
          {loading ? '탈퇴 중...' : '탈퇴하기'}
        </button>
        <button
          onClick={handleClose}
          disabled={loading}
          className="w-full py-4 bg-[#F7F7F7] text-[#888] text-base font-medium rounded-xl disabled:opacity-40"
        >
          취소
        </button>
      </div>
    </div>
  )
}
