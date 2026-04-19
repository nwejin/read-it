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
