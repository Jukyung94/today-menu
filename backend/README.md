# Today Menu Backend

Today Menu MVP의 공용 API를 제공하는 NestJS + TypeScript 모듈형 모놀리스입니다.

## 현재 구현 범위

- `Auth`: 교체 가능한 Repository 기반 guest actor 및 Bearer token
- `Conversation`: 추천 세션, 고정 질문, `sessionVersion` 낙관적 동시성
- `Recommendation`: 규칙 기반 점수 계산, 추천 결과 저장
- `Preference`: 서로 다른 식사 기록 일수 기반 개인화 추천 자격
- `Feedback`: 추천 결과별 사용자 행동 저장
- `MealLog`: 식사 기록 생성 및 페이지 조회
- `Upload`: 교체 가능한 Object Storage Provider와 메타데이터 Repository
- `Llm`: Provider 인터페이스와 규칙 기반 설명 fallback

Data 작업공간의 DB 스키마가 연결되기 전까지 Repository와 Provider의 기본
구현은 프로세스 수명 동안만 유지되는 in-memory adapter입니다. 음식 카탈로그도
추천 Repository의 임시 seed이며, Data seed가 준비되면 DB adapter로 교체해야
합니다.

## 실행

```powershell
npm.cmd install
npm.cmd run dev
```

기본 주소는 `http://localhost:4000/api/v1`입니다.

```powershell
npm.cmd run build
npm.cmd test
```

## 공통 HTTP 규칙

- JSON 필드는 `camelCase`, enum 값은 `UPPER_SNAKE_CASE`입니다.
- 인증이 필요한 요청은 `Authorization: Bearer <accessToken>`을 사용합니다.
- 모든 변경 요청은 `Idempotency-Key`가 필요합니다. 동일 사용자·경로·본문의
  재요청에는 최초 응답을 반환합니다.
- ID는 UUID, 시간은 ISO 8601입니다.
- 오류는 `{"error":{"code","message","fieldErrors?","requestId"}}` 형식입니다.
- 추천 답변은 응답의 `version`을 다음 요청의 `sessionVersion`으로 전달합니다.

## MVP endpoints

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/v1/health` | 상태 확인 |
| POST | `/api/v1/auth/guest` | guest actor와 access token 발급 |
| POST | `/api/v1/recommendation-sessions` | `GUIDED` 또는 `PERSONALIZED_RANDOM` 세션 시작 |
| GET | `/api/v1/recommendation-sessions/{sessionId}` | 세션 진행/완료 상태 조회 |
| POST | `/api/v1/recommendation-sessions/{sessionId}/answers` | 현재 질문 답변 |
| POST | `/api/v1/recommendation-feedback` | 추천 결과 행동/평점 저장 |
| POST | `/api/v1/uploads` | `file` multipart 이미지 업로드(최대 5 MB) |
| POST | `/api/v1/meal-logs` | 식사 기록 생성 |
| GET | `/api/v1/meal-logs` | `limit`, `offset` 기반 식사 기록 조회 |
| GET | `/api/v1/preferences/recommendation-eligibility` | 개인화 추천 자격 조회 |

### Guided session 예시

```json
{
  "mode": "GUIDED",
  "locale": "ko-KR"
}
```

```json
{
  "sessionVersion": 1,
  "questionKey": "category",
  "selectedValues": ["KOREAN"]
}
```

질문 순서는 `category`, `mealForm`, `tastes`, `situation`이며 옵션 값은 API
응답의 `nextQuestion.options`를 기준으로 사용합니다.

## 구조와 교체 지점

```text
src/
├─ auth/
├─ conversation/
├─ feedback/
├─ health/
├─ idempotency/
├─ llm/
├─ meal-log/
├─ preference/
├─ recommendation/
├─ shared/http/
└─ upload/
```

Controller는 HTTP 입력과 응답을, Service는 유스케이스를, Repository는 영속
데이터를 담당합니다. 외부 LLM과 파일 저장소는 Provider 인터페이스 뒤에
있습니다. DB 연결 시 각 `*_REPOSITORY` provider binding만 Data 스키마 기반
adapter로 바꾸는 것을 원칙으로 합니다.
