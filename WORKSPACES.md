# Today Menu 작업공간 협업 규칙

## 기본 원칙

각 작업공간은 전체 저장소를 읽고 다른 영역의 구현을 참고할 수 있지만, 쓰기는 자신이 소유한 경로로 제한합니다.

| 작업공간 | 쓰기 허용 경로 | 주요 책임 |
|---|---|---|
| Web | `/web/**` | 웹 화면, 웹 상태, API 연동 |
| Mobile | `/mobile/**` | React Native 화면, 네이티브 기능, API 연동 |
| Backend | `/backend/**` | API, 인증, 추천 흐름, 저장소 계층, LLM Provider |
| Data | `/data/**` | PostgreSQL 스키마, 마이그레이션, seed |
| Coordinator | 루트, `/docs/**`, `/packages/**` | 공통 계약, 통합 설정, 영역 간 조정 |

## 침범 금지

- 다른 작업공간의 파일을 직접 수정하지 않습니다.
- 루트 설정, API 공통 계약 또는 `/packages` 변경이 필요하면 자신의 `HANDOFF.md`에 요청을 기록합니다.
- Backend는 DB 스키마를 직접 변경하지 않고 Data 작업공간에 요청합니다.
- Web과 Mobile은 API 응답을 임의로 가정하지 않고 Backend 또는 API 명세에 변경을 요청합니다.
- Data는 Backend 구현을 수정하지 않고 마이그레이션 영향만 전달합니다.
- 공통 변경은 Coordinator가 검토하고 반영합니다.

## 공통 계약

- Base URL: `/api/v1`
- ID: UUID
- 날짜: ISO 8601
- JSON 필드: `camelCase`
- enum 값: `UPPER_SNAKE_CASE`
- 인증: `Authorization: Bearer <accessToken>`
- 변경 요청: `Idempotency-Key`
- 추천 동시성: `sessionVersion`

MVP API:

```text
GET  /health
POST /auth/guest
POST /recommendation-sessions
GET  /recommendation-sessions/{sessionId}
POST /recommendation-sessions/{sessionId}/answers
POST /recommendation-feedback
POST /uploads
POST /meal-logs
GET  /meal-logs
GET  /preferences/recommendation-eligibility
```

상세 명세의 기준 파일은 로컬 `docs/API_SPEC.md`입니다.

## 영역 간 요청 형식

각 작업공간의 `HANDOFF.md`에 다음 형식으로 기록합니다.

```md
## YYYY-MM-DD 요청 제목

- 대상: Backend | Data | Web | Mobile | Coordinator
- 필요 사항:
- 변경 이유:
- 호환성 영향:
- 요청/응답 또는 데이터 예시:
```

요청을 기록한 작업공간은 대상 영역의 파일을 대신 수정하지 않습니다.

## MVP 완료 기준

1. Data가 메뉴와 속성 seed 및 스키마를 제공합니다.
2. Backend가 세션·답변·추천·피드백·식사 기록 API를 제공합니다.
3. Web과 Mobile이 같은 API 계약으로 동일한 사용자 흐름을 제공합니다.
4. 규칙 기반 추천은 LLM 없이 동작합니다.
5. LLM 장애가 추천 결과 자체를 막지 않습니다.
