export type ChangelogEntry = {
  version: string
  date: string
  items: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.6',
    date: '2026-04-29',
    items: ['업데이트 내역 전체 보기 페이지 추가 (아코디언)', '프로필 닉네임 수정 기능 추가'],
  },
  {
    version: '1.5',
    date: '2026-04-27',
    items: ['서재 정렬 기능 추가 (최신순 / 오래된순 / 제목순)', '메인 화면을 서재로 변경', '빈 서재에서 책 추가 바로가기 버튼 추가', '서재/검색/친구 로딩 스켈레톤 추가 (2026-04-28)'],
  },
  {
    version: '1.4',
    date: '2026-04-25',
    items: ['친구 추가 기능 (6자리 코드로 팔로우)', '친구 서재 열람', '회원 탈퇴 기능'],
  },
  {
    version: '1.3',
    date: '2026-04-20',
    items: ['서재 통계 뷰 추가 (보유/읽기/별점 현황)'],
  },
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
