# Today Menu

선택형 멀티턴 인터랙션과 규칙 기반 추천 엔진을 결합한 메뉴 추천 서비스입니다. Web과 React Native App은 하나의 Backend API와 PostgreSQL 데이터를 공유합니다.

## 작업공간

| 경로 | 역할 | 기술 |
|---|---|---|
| `web/` | 브라우저용 서비스 | React, Vite, TypeScript |
| `mobile/` | Android/iOS 앱 | React Native Community CLI, TypeScript |
| `backend/` | 공용 API와 추천 흐름 | NestJS 목표, TypeScript |
| `data/` | DB 스키마·마이그레이션·초기 데이터 | PostgreSQL, Prisma 목표 |
| `packages/` | 생성형 API 클라이언트와 공통 계약 | Coordinator 관리 |

세부 소유권과 협업 규칙은 [WORKSPACES.md](./WORKSPACES.md)를 따릅니다.

## MVP 흐름

```text
Web / Mobile
    ↓
추천 세션 생성
    ↓
고정 질문과 답변 저장
    ↓
메뉴 DB 필터링·점수 계산
    ↓
최종 메뉴 3개
    ↓
선택·평점·식사 기록
```

LLM은 규칙 기반 추천이 완성된 후 추천 이유 생성과 후보 재정렬부터 추가합니다.

## 실행

```powershell
npm.cmd run dev:web
npm.cmd run dev:backend
```

Mobile은 Community CLI 초기화가 완료된 후 실행합니다.

```powershell
npm.cmd run start:mobile
npm.cmd run android
```
