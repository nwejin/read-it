@AGENTS.md

# read-it 프로젝트 초기 세팅

## 서비스 개요

- 서비스명: 읽었나?
- 목적: 집에 있는 책 관리 (보유 여부, 독서 상태 추적)
- 타겟: 가족용 (부모님 포함, 사용성 중요)

## 기술 스택

- Framework: Next.js (TypeScript)
- DB: Supabase
- 책 데이터: 알라딘 Open API
- 배포: Vercel
- 스타일링: Tailwind CSS

## 핵심 기능 (MVP)

1. 알라딘 API로 책 검색
2. 책장에 추가 (보유 여부)
3. 독서 상태 관리 (읽음 / 읽는 중 / 안읽음)

## 알라딘 API

- 검색: GET http://www.aladin.co.kr/ttb/api/ItemSearch.aspx
- 조회: GET http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx
- output=js 로 JSON 받기
- Next.js Route Handler에서 서버사이드 호출 필요 (http라서)
- TTB Key는 환경변수로 관리

## 우선 해줘

1. Next.js + Tailwind CSS 프로젝트 초기 세팅 (폴더 구조 포함)
2. Supabase 테이블 설계 및 연결
3. 모바일 최적화 웹앱 구성 (PWA 고려)

---

## 버전 로드맵

| 버전 | 기능 | 상태 |
|------|------|------|
| v1.0 | 책 검색 및 서재 추가, 독서 상태 관리 | ✅ 완료 |
| v1.1 | 업데이트 알림 배너 및 프로필 업데이트 이력 | ✅ 완료 |
| v1.2 | 보유/읽기 상태 UI 개선, 미보유 탭, 별점 기능 | ✅ 완료 |
| v1.3 | 서재 통계 뷰 | ✅ 완료 |

## 추가 예정 기능 리스트

- 책 메모/감상 기록
- ~~통계 페이지 (읽은 책 수, 상태별 현황)~~ → 서재 내 통계 뷰로 구현
- 책 정렬/필터 (상태별, 최근 추가순 등)

## 버전 업데이트 방법

새 기능을 배포할 때마다 아래 두 곳을 업데이트한다.

1. **이 파일(CLAUDE.md)** — 로드맵 표에서 해당 버전 상태를 `✅ 완료`로 변경
2. **`src/lib/changelog.ts`** — `CHANGELOG` 배열 맨 앞에 새 항목 추가

```ts
// 예시: v1.2 배포 시
{
  version: '1.2',
  date: '2026-xx-xx',
  items: ['책 메모/감상 기록 추가'],
},
```

`LATEST_VERSION`은 `CHANGELOG[0].version`을 자동 참조하므로 별도 수정 불필요.
