export type ChangelogEntry = {
  version: string
  date: string
  items: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.2',
    date: '2026-04-20',
    items: ['보유/읽기 상태 UI 개선 (슬라이드 선택)', '미보유 서재 탭 추가', '읽은 책 별점 기능 추가', '서재 탭 스와이프 전환'],
  },
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
