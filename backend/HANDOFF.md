# Backend Handoff Requests

## 2026-07-28 Repository adapter용 PostgreSQL 계약 요청

- 대상: Data
- 필요 사항:
  - `actors`에 UUID actor ID, `GUEST` actor type, 생성 시각을 저장할 수 있어야 합니다.
  - guest Bearer token의 해시, actor ID, 만료 시각을 영속화할 테이블 또는 기존 인증
    연동 방식을 확정해 주세요. 원문 token 저장은 피해야 합니다.
  - `recommendation_sessions`에 mode, status, integer version, locale, context JSON,
    생성/만료/완료 시각을 두고 `WHERE id = ? AND version = ?` 조건의 원자적 갱신을
    지원해 주세요.
  - `session_answers`는 session ID, question key, selected values JSON, 답변 시각과
    세션 내 중복을 막는 제약이 필요합니다.
  - `recommendation_results`는 actor/session/food ID, rank, reason, matched tags JSON,
    match score 및 생성 시각의 결과 snapshot을 보존해야 합니다.
  - `recommendation_feedback`의 action type은 `VIEWED`, `SELECTED`, `SAVED`,
    `DISLIKED`, `DO_NOT_RECOMMEND`이며 선택적 1~5 rating을 저장합니다.
  - `meal_logs`는 recommendation result/food/custom food 중 하나로 음식을 식별하고,
    1~5 rating, note, eatenAt을 저장합니다. `meal_log_photos`는 actor 소유 upload와
    연결되어야 합니다.
  - `uploaded_files`는 actor ID, object key, 원본 파일명, MIME type, byte size,
    `READY` status 및 생성 시각을 저장합니다.
  - 다중 인스턴스에서도 동작하도록 Idempotency-Key, actor, method/path, request hash,
    응답 status/body를 TTL과 함께 저장할 영속 계약이 필요합니다.
- 변경 이유: 현재 Backend는 위 Repository 인터페이스의 in-memory adapter로
  동작하며 재시작 시 모든 데이터가 사라집니다.
- 호환성 영향: Data adapter 도입 시 API 요청/응답 계약은 변경하지 않고 provider
  binding만 교체할 예정입니다.
- 요청/응답 또는 데이터 예시: 추천 세션 갱신은 요청 `sessionVersion=3`일 때 DB의
  `version=3`인 행 하나만 `version=4`로 갱신하고, 0행이면 충돌로 처리해야 합니다.

## 2026-07-28 미정 MVP 응답 계약 확정 요청

- 대상: Coordinator
- 필요 사항:
  - 보완 공통 계약에 응답 형태가 없던 guest auth, upload, meal-log 목록,
    recommendation eligibility의 최종 response schema와 pagination 방식을 확정해
    주세요.
  - mutation 성공 status를 현재 구현처럼 생성은 `201`, 답변은 `200`으로 둘지
    확정해 주세요.
  - `Idempotency-Key` 재사용 범위를 현재의 actor + method + path 단위로 유지할지,
    actor 전체 범위로 제한할지 확정해 주세요.
- 변경 이유: Web/Mobile 공통 클라이언트 생성 전에 임시 Backend 응답을 공통
  OpenAPI 계약으로 고정해야 합니다.
- 호환성 영향: 확정 결과에 따라 Web/Mobile 연동 및 이후 생성 클라이언트 타입이
  달라질 수 있습니다.
- 요청/응답 또는 데이터 예시: 현재 자격 응답은
  `{"eligible":false,"minimumHistoryDays":7,"recordedDays":1,"remainingDays":6}`입니다.
