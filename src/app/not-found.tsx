import { FileQuestion } from 'lucide-react'
import ErrorPage from '@/components/ErrorPage'

export default function NotFound() {
  return (
    <ErrorPage
      icon={FileQuestion}
      title="페이지를 찾을 수 없어요"
      description="요청하신 페이지가 존재하지 않아요."
      action={{ label: '홈으로', href: '/library' }}
    />
  )
}
