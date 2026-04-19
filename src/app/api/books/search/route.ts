import { NextRequest, NextResponse } from 'next/server'
import { searchBooks } from '@/lib/aladin/api'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  const page = request.nextUrl.searchParams.get('page') ?? '1'

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: '검색어를 입력해 주세요.' }, { status: 400 })
  }

  try {
    const books = await searchBooks(query.trim(), Number(page))
    return NextResponse.json({ books })
  } catch {
    return NextResponse.json({ error: '책 검색에 실패했어요.' }, { status: 500 })
  }
}
