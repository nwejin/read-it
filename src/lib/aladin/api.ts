import { AladinBook } from '@/types'

const BASE_URL = 'http://www.aladin.co.kr/ttb/api'
const TTB_KEY = process.env.ALADIN_TTB_KEY!

interface AladinSearchItem {
  title: string
  author: string
  pubDate: string
  description: string
  isbn13: string
  cover: string
  publisher: string
  link: string
}

interface AladinResponse {
  totalResults: number
  item: AladinSearchItem[]
}

export interface AladinBookDetail extends AladinBook {
  subInfo?: {
    itemPage?: number
  }
  categoryName?: string
  fullDescription?: string
}

export async function fetchBookDetail(isbn13: string): Promise<AladinBookDetail | null> {
  const params = new URLSearchParams({
    TTBKey: TTB_KEY,
    itemIdType: 'ISBN13',
    ItemId: isbn13,
    output: 'js',
    Version: '20131101',
    OptResult: 'fulldescription',
  })

  const res = await fetch(`${BASE_URL}/ItemLookUp.aspx?${params}`, {
    next: { revalidate: 60 * 60 * 24 }, // 24시간 캐시
  })

  if (!res.ok) return null

  const data = await res.json()
  const item = data.item?.[0]
  if (!item) return null

  return {
    isbn13: item.isbn13,
    title: item.title,
    author: item.author,
    cover: item.cover,
    publisher: item.publisher,
    pubDate: item.pubDate,
    description: item.description,
    link: item.link,
    fullDescription: item.fullDescription,
    categoryName: item.categoryName,
    subInfo: item.subInfo,
  }
}

export async function fetchBestsellers(): Promise<AladinBook[]> {
  const params = new URLSearchParams({
    TTBKey: TTB_KEY,
    QueryType: 'Bestseller',
    MaxResults: '10',
    SearchTarget: 'Book',
    output: 'js',
    Version: '20131101',
  })

  const res = await fetch(`${BASE_URL}/ItemList.aspx?${params}`, {
    next: { revalidate: 60 * 60 }, // 1시간 캐시
  })

  if (!res.ok) throw new Error('베스트셀러 API 요청 실패')

  const data: AladinResponse = await res.json()
  if (!data.item) return []

  return data.item
    .filter((item) => item.isbn13 && item.isbn13.trim() !== '')
    .map((item) => ({
      isbn13: item.isbn13,
      title: item.title,
      author: item.author,
      cover: item.cover,
      publisher: item.publisher,
      pubDate: item.pubDate,
      description: item.description,
      link: item.link,
    }))
}

export async function searchBooks(query: string, page = 1): Promise<AladinBook[]> {
  const params = new URLSearchParams({
    TTBKey: TTB_KEY,
    Query: query,
    QueryType: 'Keyword',
    MaxResults: '10',
    start: String(page),
    SearchTarget: 'Book',
    output: 'js',
    Version: '20131101',
  })

  const res = await fetch(`${BASE_URL}/ItemSearch.aspx?${params}`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error('알라딘 API 요청 실패')

  const data: AladinResponse = await res.json()

  if (!data.item) return []

  return data.item
    .filter((item) => item.isbn13 && item.isbn13.trim() !== '')
    .map((item) => ({
      isbn13: item.isbn13,
      title: item.title,
      author: item.author,
      cover: item.cover,
      publisher: item.publisher,
      pubDate: item.pubDate,
      description: item.description,
      link: item.link,
    }))
}
