# MVP 기준값

API와 DB enum 값은 `UPPER_SNAKE_CASE`를 사용합니다. 질문 문구와 선택지는 Backend 설정이 소유하며, 이 문서는 DB seed와 규칙 기반 추천에서 사용하는 의미 기준만 정의합니다.

## 세션 및 이벤트 enum

### `RecommendationMode`

| 값 | 의미 |
|---|---|
| `GUIDED` | 고정 질문을 순서대로 답해 추천 |
| `PERSONALIZED_RANDOM` | 누적 기록과 현재 context를 사용한 개인화 랜덤 추천 |

### `RecommendationSessionStatus`

| 값 | 의미 |
|---|---|
| `IN_PROGRESS` | 질문 진행 중 |
| `COMPLETED` | 결과 생성 완료 |
| `ABANDONED` | 사용자가 중단 |
| `EXPIRED` | `expiresAt` 경과 후 만료 처리 |

### `FeedbackActionType`

`VIEWED`, `SELECTED`, `SAVED`, `DISLIKED`, `DO_NOT_RECOMMEND`

피드백은 현재 상태가 아니라 시간순 이벤트로 저장합니다. 같은 결과에 여러 액션을 기록할 수 있습니다.

### 기타 enum

- `ActorKind`: `GUEST`, `REGISTERED`
- `MealLogSource`: `MANUAL`, `RECOMMENDATION`
- `UploadStatus`: `PENDING`, `READY`, `FAILED`, `DELETED`
- `FoodAttributeDimension`: `MEAL_FORM`, `TASTE`, `SITUATION`, `BUDGET`, `FEATURE`

## Context 계약

`recommendation_sessions.context`와 `recommendation_results.context_snapshot`은 아래 camelCase JSON 구조를 보존합니다.

```json
{
  "contextVersion": 1,
  "category": "KOREAN",
  "mealForm": "RICE_BOWL",
  "tastes": ["SPICY", "SAVORY"],
  "situation": "HEARTY",
  "budgetMax": 12000,
  "constraints": {
    "excludedFeatures": []
  },
  "location": {
    "latitude": 37.5,
    "longitude": 127.0
  },
  "attributes": {}
}
```

- `contextVersion`은 필수 양의 정수입니다. MVP 초기값은 `1`입니다.
- 알 수 없는 확장 필드는 삭제하지 않고 그대로 스냅샷에 보존합니다.
- `budgetMax`는 KRW 정수 상한으로 해석합니다.
- 위치는 추천 시점 값만 저장하며, 정밀 위치 보존·보관 기간은 Backend 개인정보 정책에서 결정해야 합니다.

## 카테고리

`foods.category` 기준값:

| 값 | 설명 |
|---|---|
| `KOREAN` | 한식 |
| `KOREAN_SNACK` | 분식 |
| `CHINESE` | 중식 |
| `JAPANESE` | 일식 |
| `WESTERN` | 양식 |
| `SOUTHEAST_ASIAN` | 동남아시아 음식 |
| `INDIAN` | 인도 음식 |
| `MEXICAN` | 멕시코 음식 |
| `HEALTHY` | 샐러드·포케 등 건강 지향 메뉴 |

## 음식 속성

### `MEAL_FORM`

`RICE_BOWL`, `SOUP_STEW`, `NOODLE`, `HANDHELD`, `SNACK`, `SHARED_DISH`, `PLATE`, `BITE_SIZED`, `SALAD`

### `TASTE`

`SPICY`, `SAVORY`, `FRESH`, `RICH`, `MILD`, `SWEET_SAVORY`, `TANGY`, `LIGHT`

### `SITUATION`

`QUICK`, `COMFORT`, `HEARTY`, `SOLO`, `GROUP`, `HANGOVER`, `DATE`, `HEALTH_CONSCIOUS`, `LATE_NIGHT`, `DELIVERY`

### `BUDGET`

| 값 | seed 분류 기준 |
|---|---|
| `LOW` | 8,000원 이하 |
| `MID` | 8,001원 이상 15,000원 이하 |
| `HIGH` | 15,001원 이상 |

실제 예산 필터는 `foods.estimated_price <= context.budgetMax`로 판정하고, `BUDGET` 태그는 설명과 점수 보조에 사용합니다.

### `FEATURE`

`HIGH_PROTEIN`, `VEGETABLE_FORWARD`, `VEGETARIAN`, `WARM`, `COLD`, `TAKEOUT_FRIENDLY`, `DELIVERY_FRIENDLY`

## 점수 및 스냅샷 기준

- `food_attributes.weight`는 동일 속성 일치 시의 상대 가중치이며 양수입니다.
- `recommendation_results.match_score`는 `0..100` 범위입니다.
- `score_breakdown`에는 최소한 `rulesetVersion`, 적용 규칙, 규칙별 원점수·가중치·기여점수, 제외 규칙을 저장합니다.
- `food_snapshot`에는 최소한 결과 생성 당시 `id`, `name`, `category`, `estimatedPrice`, 전체 속성과 가중치를 저장합니다.
- `matched_tags`는 API 계약의 `{ "key": "...", "label": "..." }` 배열을 저장합니다.

## Seed 출처

`seeds/development.sql`의 메뉴명, 설명, 속성 조합은 MVP 규칙 검증을 위해 프로젝트 내부에서 직접 구성한 합성 데이터입니다. 외부 데이터셋이나 서비스 데이터를 복사하지 않았습니다. `estimated_price`는 실제 시세 조사값이 아닌 필터 경계 검증용 예시값이므로 사용자에게 실시간 가격처럼 표시하면 안 됩니다.
