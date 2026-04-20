export type ReadStatus = 'read' | 'reading' | 'want_to_read'

export interface Profile {
  id: string
  nickname: string
  created_at: string
}

export interface Book {
  isbn13: string
  title: string
  author: string | null
  cover: string | null
  publisher: string | null
  pub_date: string | null
  description: string | null
  aladin_url: string | null
  created_at: string
}

export interface UserBook {
  id: string
  user_id: string
  isbn13: string
  is_owned: boolean
  read_status: ReadStatus | null
  rating: number | null
  created_at: string
  updated_at: string
}

// 알라딘 API 응답 타입
export interface AladinBook {
  isbn13: string
  title: string
  author: string
  cover: string
  publisher: string
  pubDate: string
  description: string
  link: string
}

// 검색 결과 카드용 (책 + 내 상태 합친 타입)
export interface BookWithStatus extends AladinBook {
  userBook?: UserBook | null
}
