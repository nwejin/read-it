export type ChangelogEntry = {
  version: string
  date: string
  items: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.1',
    date: '2026-04-20',
    items: ['업데이트 알림 기능 추가'],
  },
  {
    version: '1.0',
    date: '2026-04-01',
    items: ['책 검색 및 서재 추가', '독서 상태 관리'],
  },
]

export const LATEST_VERSION = CHANGELOG[0].version
