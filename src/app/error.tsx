'use client'

import { AlertCircle } from 'lucide-react'
import ErrorPage from '@/components/ErrorPage'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorPage
      icon={AlertCircle}
      title="오류가 발생했어요"
      description="잠시 후 다시 시도해 주세요."
      action={{ label: '다시 시도', onClick: reset }}
    />
  )
}
