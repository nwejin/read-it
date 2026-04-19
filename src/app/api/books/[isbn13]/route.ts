import { NextRequest, NextResponse } from 'next/server'
import { fetchBookDetail } from '@/lib/aladin/api'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ isbn13: string }> }
) {
  const { isbn13 } = await params

  try {
    const book = await fetchBookDetail(isbn13)
    if (!book) return NextResponse.json({ error: '책을 찾을 수 없어요.' }, { status: 404 })
    return NextResponse.json({ book })
  } catch {
    return NextResponse.json({ error: '책 정보를 불러오지 못했어요.' }, { status: 500 })
  }
}
