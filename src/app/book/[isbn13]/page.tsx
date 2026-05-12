import { notFound } from 'next/navigation'
import { fetchBookDetail } from '@/lib/aladin/api'
import BookDetailClient from '@/components/BookDetailClient'

export default async function BookDetailPage({ params }: { params: Promise<{ isbn13: string }> }) {
  const { isbn13 } = await params
  const book = await fetchBookDetail(isbn13)

  if (!book) notFound()

  return <BookDetailClient book={book} />
}
