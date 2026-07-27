# Data Handoff Requests

## 2026-07-28 Prisma 7 데이터 계층 연동

- 대상: Backend
- 필요 사항:
  - `data/prisma/schema.prisma`에서 Prisma Client를 생성하고 Backend 패키지에 Prisma 7.9 호환 `@prisma/client`, PostgreSQL driver adapter와 driver 의존성을 선언해 주세요.
  - 배포 시 `data` 디렉터리에서 `npm run migrate:deploy`를 실행한 뒤 `seeds/development.sql`은 개발 환경에만 적용해 주세요.
  - API의 `sessionVersion`은 `recommendation_sessions.version`에 대응합니다. 답변 transaction에서 `id`, `actor_id`, 기존 `version`, `IN_PROGRESS` 상태를 함께 조건으로 잠그고 성공 시 version을 1 증가시키세요. `session_answers.session_version`에는 증가 후 확정 version을 기록하세요.
  - `selectedValues`는 string/number/boolean만 포함한 비어 있지 않은 JSON 배열로 저장하세요.
  - 완료 처리 transaction에서 결과 전체를 저장한 뒤 세션의 `status=COMPLETED`, `completed_at`, `ruleset_version`을 함께 확정하세요.
  - 각 결과의 `context_snapshot`, `food_snapshot`, `score_breakdown`, `ruleset_version`을 채우세요. `matched_tags`는 `{key,label}` 배열, `match_score`는 `0..100`, rating은 `1..5`입니다.
  - 피드백 저장 시 인증 actor가 결과 소유 세션의 actor인지 검증하세요. DB는 `resultId`와 `sessionId`의 조합 일치까지 보장합니다.
  - MealLog 요청에 `recommendationResultId`가 있으면 `source=RECOMMENDATION`, 없으면 `source=MANUAL`로 저장하세요. `photoIds`는 같은 actor가 소유하고 `READY`인 `uploaded_files`만 연결하세요.
- 변경 이유: Data MVP 스키마와 API 보완 계약의 동시성, 소유권, 추천 재현성 규칙을 Backend transaction에 반영해야 합니다.
- 호환성 영향: Prisma 7.9 계열은 Node.js `20.19+`, `22.12+` 또는 `24+`가 필요합니다. JSON/BigInt/Decimal은 API 직렬화 전에 명시적으로 number/string 정책을 적용해야 합니다.
- 요청/응답 또는 데이터 예시:

```json
{
  "contextSnapshot": {
    "contextVersion": 1,
    "category": "KOREAN",
    "mealForm": "RICE_BOWL",
    "tastes": ["SPICY"],
    "budgetMax": 12000
  },
  "scoreBreakdown": {
    "rulesetVersion": "rules-v1",
    "rules": [
      {
        "key": "tasteMatch",
        "rawScore": 1,
        "weight": 30,
        "contribution": 30
      }
    ],
    "excludedBy": []
  }
}
```

## 2026-07-28 공통 계약 보존·개인정보 정책 확인

- 대상: Coordinator | Backend
- 필요 사항: `Context.location`의 좌표 정밀도, 보존 기간, 삭제/익명화 정책과 actor soft-delete 이후 추천·식사 기록 처리 정책을 공통 운영 문서에서 결정해 주세요.
- 변경 이유: 추천 당시 context 재현 요구와 위치정보 최소 보존 원칙 사이의 운영 기준이 필요합니다.
- 호환성 영향: 향후 위치 필드 암호화·축약 또는 context migration이 필요할 수 있습니다. 현재 DB는 전달받은 context를 JSONB snapshot으로 보존합니다.
- 요청/응답 또는 데이터 예시: 정밀 좌표 대신 허용된 격자/지역 코드만 context에 전달하는 방식을 권장합니다.
