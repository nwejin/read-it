'use client'

import { useEffect, useState } from 'react'
import { CHANGELOG, LATEST_VERSION } from '@/lib/changelog'

const STORAGE_KEY = 'last_seen_version'

export default function UpdateBanner() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY)
    if (lastSeen !== LATEST_VERSION) {
      setVisible(true)
    }
    setMounted(true)
  }, [])

  function handleClose() {
    localStorage.setItem(STORAGE_KEY, LATEST_VERSION)
    setVisible(false)
  }

  if (!mounted) return null

  const latest = CHANGELOG[0]

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="bg-[#111] text-white px-5 py-3 flex items-start justify-between gap-3 shadow-lg">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            v{latest.version} 업데이트
          </p>
          <ul className="mt-0.5">
            {latest.items.map((item) => (
              <li key={item} className="text-xs text-[#ccc]">
                • {item}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={handleClose}
          className="text-[#aaa] text-lg leading-none shrink-0 pt-0.5"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
