'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNewFriendCount } from '@/hooks/useFriends'
import { BookOpen, Search, Users, User } from 'lucide-react'

const tabs = [
  {
    href: '/library',
    label: '서재',
    icon: (active: boolean) => <BookOpen className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />,
  },
  {
    href: '/search',
    label: '검색',
    icon: (active: boolean) => <Search className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />,
  },
  {
    href: '/friends',
    label: '친구',
    icon: (active: boolean) => <Users className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />,
  },
  {
    href: '/profile',
    label: '프로필',
    icon: (active: boolean) => <User className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />,
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { data: newFriendCount = 0 } = useNewFriendCount()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0]">
      <div className="flex max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 pb-6 text-xs font-medium transition-all active:scale-95 ${
                active ? 'text-[#111]' : 'text-[#bbb]'
              }`}
            >
              <div className="relative">
                {tab.icon(active)}
                {tab.href === '/friends' && newFriendCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
