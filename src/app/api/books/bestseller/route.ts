import { NextResponse } from 'next/server'
import { fetchBestsellers } from '@/lib/aladin/api'

export async function GET() {
  try {
    const books = await fetchBestsellers()
    return NextResponse.json({ books })
  } catch {
    return NextResponse.json({ error: '베스트셀러를 불러오지 못했어요.' }, { status: 500 })
  }
}
