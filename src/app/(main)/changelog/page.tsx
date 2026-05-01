'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronDown } from 'lucide-react'
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
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
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
                <ChevronDown
                  className={`w-4 h-4 text-[#ccc] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  strokeWidth={2}
                />
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
