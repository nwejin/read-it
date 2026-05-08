import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface ErrorPageProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export default function ErrorPage({ icon: Icon, title, description, action }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-8">
      <Icon className="w-12 h-12 text-[#ccc] mb-5" strokeWidth={1.5} />
      <p className="text-lg font-semibold text-[#111] mb-2">{title}</p>
      {description && <p className="text-sm text-[#aaa] mb-8">{description}</p>}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="px-6 py-3 bg-[#111] text-white text-sm font-semibold rounded-xl active:opacity-70"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="px-6 py-3 bg-[#111] text-white text-sm font-semibold rounded-xl active:opacity-70"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
