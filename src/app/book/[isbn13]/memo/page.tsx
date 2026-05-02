'use client'

import { use, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Scissors } from 'lucide-react'
import { AladinBookDetail } from '@/lib/aladin/api'
import { useBookMemo, useSaveBookMemo } from '@/hooks/useBookMemo'

const FONT_SIZES = [12, 14, 16, 18, 20, 24]
const FONT_COLORS = [
  { value: '#111111', label: '검정' },
  { value: '#555555', label: '회색' },
  { value: '#1a56db', label: '파랑' },
  { value: '#7e3af2', label: '보라' },
  { value: '#057a55', label: '초록' },
  { value: '#c81e1e', label: '빨강' },
]

async function fetchDetail(isbn13: string): Promise<AladinBookDetail> {
  const res = await fetch(`/api/books/${isbn13}`)
  const data = await res.json()
  return data.book
}

interface PageDividerProps {
  index: number
  totalPages: number
  onDelete: (index: number) => void
}

function PageDivider({ index, totalPages, onDelete }: PageDividerProps) {
  const [showX, setShowX] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showX) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowX(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [showX])

  function handleTap() {
    setShowX((v) => !v)
  }

  function handleLongPressStart() {
    longPressTimer.current = setTimeout(() => {
      setShowConfirm(true)
    }, 500)
  }

  function handleLongPressEnd() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative flex items-center my-2 select-none"
        onClick={handleTap}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
      >
        <div className="flex-1 h-px bg-[#E0E0E0]" />
        <span className="mx-3 text-xs text-[#ccc] whitespace-nowrap shrink-0">
          {index + 1} / {totalPages}
        </span>
        <div className="flex-1 h-px bg-[#E0E0E0]" />
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(index)
          }}
          className={`absolute right-0 w-5 h-5 bg-[#888] text-white rounded-full flex items-center justify-center text-xs transition-opacity duration-200 ${showX ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          aria-label="구분선 삭제"
        >
          ×
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl px-6 py-5 mx-8 shadow-xl">
            <p className="text-base font-semibold text-[#111] text-center mb-1">구분선을 삭제할까요?</p>
            <p className="text-sm text-[#888] text-center mb-5">두 페이지의 내용이 합쳐져요.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-[#F0F0F0] text-[#555] font-medium text-sm">
                취소
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false)
                  onDelete(index)
                }}
                className="flex-1 py-3 rounded-xl bg-[#111] text-white font-medium text-sm">
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function MemoPage({ params }: { params: Promise<{ isbn13: string }> }) {
  const { isbn13 } = use(params)
  const router = useRouter()

  const { data: book } = useQuery({
    queryKey: ['bookDetail', isbn13],
    queryFn: () => fetchDetail(isbn13),
    staleTime: 1000 * 60 * 60 * 24,
  })

  const { data: memo, isLoading } = useBookMemo(isbn13)
  const { mutateAsync: saveMemo, isPending: saving } = useSaveBookMemo()

  const [pages, setPages] = useState<string[]>([''])
  const [fontSize, setFontSize] = useState(16)
  const [fontColor, setFontColor] = useState('#111111')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [focusedPage, setFocusedPage] = useState(0)
  const [saveLabel, setSaveLabel] = useState('저장')

  // 제스처 상태
  const [gestureProgress, setGestureProgress] = useState(0) // 0~1
  const gestureRef = useRef<{
    active: boolean
    startY: number
    timer: ReturnType<typeof setInterval> | null
    animFrame: ReturnType<typeof requestAnimationFrame> | null
    startTime: number
  }>({ active: false, startY: 0, timer: null, animFrame: null, startTime: 0 })

  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([])
  const colorPickerRef = useRef<HTMLDivElement>(null)

  // 메모 로드
  useEffect(() => {
    if (memo) {
      setPages(memo.pages.length > 0 ? memo.pages : [''])
      setFontSize(memo.font_size)
      setFontColor(memo.font_color)
    }
  }, [memo])

  // 색상 팝오버 외부 클릭 닫기
  useEffect(() => {
    if (!showColorPicker) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [showColorPicker])

  // textarea 높이 자동 조절
  function autoResize(el: HTMLTextAreaElement | null) {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  function updatePage(index: number, value: string) {
    setPages((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    setIsDirty(true)
  }

  function insertPageBreak(afterIndex: number) {
    setPages((prev) => {
      const next = [...prev]
      next.splice(afterIndex + 1, 0, '')
      return next
    })
    setIsDirty(true)
    setTimeout(() => {
      textareaRefs.current[afterIndex + 1]?.focus()
    }, 50)
  }

  function deleteDivider(dividerIndex: number) {
    // dividerIndex: 0이면 pages[0]과 pages[1] 사이 구분선
    setPages((prev) => {
      const next = [...prev]
      const merged = next[dividerIndex] + '\n' + next[dividerIndex + 1]
      next.splice(dividerIndex, 2, merged)
      return next
    })
    setIsDirty(true)
  }

  const doSave = useCallback(async () => {
    try {
      await saveMemo({ isbn13, pages, fontSize, fontColor })
      setIsDirty(false)
      setSaveLabel('저장됨')
      setTimeout(() => setSaveLabel('저장'), 1500)
    } catch {
      setSaveLabel('오류')
      setTimeout(() => setSaveLabel('저장'), 1500)
    }
  }, [saveMemo, isbn13, pages, fontSize, fontColor])

  async function handleBack() {
    if (isDirty) await doSave()
    router.back()
  }

  // 스크롤 업 제스처 (페이지 나누기)
  function handleTouchStart(e: React.TouchEvent) {
    gestureRef.current.startY = e.touches[0].clientY
    gestureRef.current.active = false
  }

  function handleTouchMove(e: React.TouchEvent) {
    const deltaY = gestureRef.current.startY - e.touches[0].clientY
    const g = gestureRef.current

    if (deltaY >= 60) {
      if (!g.active) {
        g.active = true
        g.startTime = Date.now()
        g.timer = setInterval(() => {
          const elapsed = Date.now() - g.startTime
          const progress = Math.min(elapsed / 1000, 1)
          setGestureProgress(progress)
          if (progress >= 1) {
            clearInterval(g.timer!)
            g.timer = null
            g.active = false
            setGestureProgress(0)
            insertPageBreak(focusedPage)
          }
        }, 16)
      }
    } else {
      if (g.active) {
        g.active = false
        if (g.timer) {
          clearInterval(g.timer)
          g.timer = null
        }
        setGestureProgress(0)
      }
    }
  }

  function handleTouchEnd() {
    const g = gestureRef.current
    if (g.active) {
      g.active = false
      if (g.timer) {
        clearInterval(g.timer)
        g.timer = null
      }
      setGestureProgress(0)
    }
  }

  const fontSizeIndex = FONT_SIZES.indexOf(fontSize)

  function decreaseFontSize() {
    if (fontSizeIndex > 0) {
      setFontSize(FONT_SIZES[fontSizeIndex - 1])
      setIsDirty(true)
    }
  }

  function increaseFontSize() {
    if (fontSizeIndex < FONT_SIZES.length - 1) {
      setFontSize(FONT_SIZES[fontSizeIndex + 1])
      setIsDirty(true)
    }
  }

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 제스처 progress bar */}
      {gestureProgress > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-[#E0E0E0]">
          <div
            className="h-full bg-[#1a56db] transition-none"
            style={{ width: `${gestureProgress * 100}%` }}
          />
        </div>
      )}

      {/* 상단 툴바 */}
      <div className="sticky top-0 bg-white z-40 border-b border-[#F0F0F0]">
        <div className="flex items-center px-4 pt-14 pb-3 gap-3">
          {/* 뒤로가기 */}
          <button onClick={handleBack} className="shrink-0 text-[#111] active:opacity-50">
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* 책 제목 */}
          <span className="flex-1 text-sm font-medium text-[#111] truncate min-w-0">
            {book?.title ?? '메모'}
          </span>

          {/* 컨트롤 영역 */}
          <div className="flex items-center gap-1 shrink-0">
            {/* 폰트 크기 줄이기 */}
            <button
              onClick={decreaseFontSize}
              disabled={fontSizeIndex === 0}
              className="w-8 h-8 flex items-center justify-center text-xs font-bold text-[#555] disabled:text-[#ccc] active:bg-[#F0F0F0] rounded-lg"
            >
              A−
            </button>

            {/* 폰트 크기 키우기 */}
            <button
              onClick={increaseFontSize}
              disabled={fontSizeIndex === FONT_SIZES.length - 1}
              className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#555] disabled:text-[#ccc] active:bg-[#F0F0F0] rounded-lg"
            >
              A+
            </button>

            {/* 색상 선택 */}
            <div ref={colorPickerRef} className="relative">
              <button
                onClick={() => setShowColorPicker((v) => !v)}
                className="w-8 h-8 flex items-center justify-center active:bg-[#F0F0F0] rounded-lg"
                aria-label="글자 색상"
              >
                <span className="text-base" style={{ color: fontColor }}>A</span>
              </button>
              {showColorPicker && (
                <div className="absolute right-0 top-10 bg-white border border-[#E0E0E0] rounded-2xl shadow-xl p-3 flex gap-2 z-50">
                  {FONT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        setFontColor(c.value)
                        setShowColorPicker(false)
                        setIsDirty(true)
                      }}
                      className="w-7 h-7 rounded-full border-2 transition-transform active:scale-90"
                      style={{
                        backgroundColor: c.value,
                        borderColor: fontColor === c.value ? '#111' : 'transparent',
                      }}
                      aria-label={c.label}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 페이지 나누기 버튼 */}
            <button
              onClick={() => insertPageBreak(focusedPage)}
              className="w-8 h-8 flex items-center justify-center active:bg-[#F0F0F0] rounded-lg"
              aria-label="페이지 나누기"
            >
              <Scissors className="w-4 h-4 text-[#555]" strokeWidth={2} />
            </button>

            {/* 저장 버튼 */}
            <button
              onClick={doSave}
              disabled={saving || !isDirty}
              className="px-3 h-8 bg-[#111] text-white text-xs font-semibold rounded-lg disabled:bg-[#E0E0E0] disabled:text-[#aaa] active:opacity-70 transition-colors"
            >
              {saving ? '저장 중' : saveLabel}
            </button>
          </div>
        </div>

        {/* 제스처 힌트 */}
        {gestureProgress > 0 && (
          <p className="text-center text-xs text-[#1a56db] pb-2 animate-pulse">
            손을 유지하면 페이지가 나뉘어요
          </p>
        )}
      </div>

      {/* 메모 본문 */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-[#ccc] text-sm">
          불러오는 중...
        </div>
      ) : (
        <div className="flex-1 px-5 pt-5 pb-32">
          {pages.map((pageContent, i) => (
            <div key={i}>
              <textarea
                ref={(el) => { textareaRefs.current[i] = el }}
                value={pageContent}
                onChange={(e) => {
                  updatePage(i, e.target.value)
                  autoResize(e.target)
                }}
                onFocus={() => setFocusedPage(i)}
                onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
                placeholder={i === 0 ? '여기에 자유롭게 적어보세요.' : ''}
                className="w-full resize-none outline-none leading-relaxed bg-transparent placeholder:text-[#D0D0D0]"
                style={{
                  fontSize: `${fontSize}px`,
                  color: fontColor,
                  minHeight: '120px',
                }}
                rows={1}
              />
              {i < pages.length - 1 && (
                <PageDivider
                  index={i}
                  totalPages={pages.length}
                  onDelete={deleteDivider}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
