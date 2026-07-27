# Web Handoff Requests

Web 작업 중 다른 작업공간이나 공통 계약의 변경이 필요할 때 여기에 기록합니다.

## 2026-07-28 Web HTTP adapter 연동용 응답 계약 확인

- 대상: Backend
- 필요 사항: `POST /auth/guest`, `POST /uploads`, `POST /meal-logs`,
  `GET /meal-logs`, `GET /preferences/recommendation-eligibility`의 정확한
  성공 응답 DTO와 추천 세션 버전 충돌 시 오류 `code`를 확정해 주세요.
- 변경 이유: 추천 세션·답변·결과·피드백·식사 기록 요청 DTO는 보완 공통
  계약에 맞췄지만, 위 성공 응답의 전체 필드는 아직 제공되지 않았습니다.
  Web은 현재 이 차이를 `ApiClient` adapter 안에 격리하고 mock을 기본으로
  사용합니다.
- 호환성 영향: 확정된 응답이 현재 Web 표시 모델과 다르면
  `web/src/api/httpClient.ts`에서만 정규화하면 되며 페이지 변경은
  필요하지 않습니다.
- 요청/응답 또는 데이터 예시: Guest는 최소
  `{ accessToken, expiresAt }`, Upload는 최소 `{ id, url? }`,
  eligibility는 `{ eligible, recordedDays, requiredDays }`, meal log 조회는
  화면에 사용할 `{ id, menuName, rating, eatenAt, note?, photoUrl? }[]`가
  필요합니다.
