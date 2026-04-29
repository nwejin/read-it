'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CHANGELOG } from '@/lib/changelog'

export default function ChangelogPage() {
  const router = useRouter()
  const [openVersions, setOpenVersions] = useState<Set<string>>(
    new Set(CHANGELOG.map((e) => e.version))
  )

  function toggle(version: string) {
    setOpenVersions((prev) => {
      const next = new Set(prev)
      next.has(version) ? next.delete(version) : next.add(version)
      return next
    })
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="sticky top-0 bg-white z-10 px-5 pt-14 pb-4 border-b border-[#F0F0F0] flex items-center gap-3 mb-0">
        <button
          onClick={() => router.back()}
          className="text-[#111] -ml-1 p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-[#111] tracking-tight">업데이트 내역</h1>
      </div>

      <div className="px-5 pb-10">
        {CHANGELOG.map((entry) => {
          const isOpen = openVersions.has(entry.version)
          return (
            <div key={entry.version} className="border-b border-[#F0F0F0]">
              <button
                onClick={() => toggle(entry.version)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#111]">v{entry.version}</span>
                  <span className="text-xs text-[#aaa]">{entry.date}</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 text-[#ccc] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <ul className="pb-4 space-y-0.5">
                  {entry.items.map((item) => (
                    <li key={item} className="text-sm text-[#888]">• {item}</li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
