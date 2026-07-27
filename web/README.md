# Web Workspace

React, Vite, TypeScript 기반 브라우저용 Today Menu 서비스입니다.

## 소유 범위

- 수정 가능: `/web/**`
- 읽기 가능: 전체 저장소
- 수정 금지: `/mobile`, `/backend`, `/data`, 루트, `/docs`, `/packages`

공통 변경은 [HANDOFF.md](./HANDOFF.md)에 요청합니다.

## 현재 상태

기존 모바일 우선 목업을 보존한 상태입니다. 질문, 추천 메뉴, 기록은 아직 컴포넌트 내부의 고정 데이터이며 Backend API와 연결되지 않았습니다.

## MVP 목표

1. 화면 단위 구조와 API 상태를 분리합니다.
2. Guest 인증 토큰을 관리합니다.
3. 추천 세션 시작·복구·답변 API를 연결합니다.
4. 서버가 반환한 질문과 선택지를 렌더링합니다.
5. 추천 결과·피드백·식사 기록 API를 연결합니다.
6. 로딩·오류·세션 만료·버전 충돌을 처리합니다.

## 실행

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

기본값은 Backend 없이 동작하는 in-memory mock adapter입니다. 실제 API를
사용할 때는 `.env.local`에 다음 값을 설정합니다.

```text
VITE_API_MODE=http
VITE_API_BASE_URL=/api/v1
```

## 현재 구조

```text
src/api/types.ts                 공통 API 계약과 Web 표시 모델
src/api/client.ts                UI가 의존하는 ApiClient 경계
src/api/mockClient.ts            Backend 독립 개발용 mock adapter
src/api/httpClient.ts            /api/v1 HTTP adapter
src/api/storage.ts               Guest 토큰·복구 세션 ID 저장
src/state/useRecommendationFlow  추천 서버 상태와 충돌 복구
src/pages                        기존 목업의 화면 구조
```

- Guest 토큰과 진행 중인 추천 세션 ID는 탭 단위 `sessionStorage`에
  저장합니다.
- `useRecommendationFlow`가 세션 생성·복구, 답변 제출, 로딩·오류,
  `sessionVersion` 충돌 시 최신 세션 재조회를 담당합니다.
- 질문 수, 문구, 선택지는 컴포넌트가 아니라 API 응답을 기준으로
  렌더링합니다.
- `VITE_API_MODE=http` 전환 전에는 [HANDOFF.md](./HANDOFF.md)의 미확정
  응답 계약을 Backend와 맞춰야 합니다.
