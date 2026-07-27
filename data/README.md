# Data Workspace

Today Menu MVP의 PostgreSQL 15+ 데이터 계층입니다. Prisma ORM 7 스키마, 순서가 보장되는 migration, 합성 메뉴 seed와 추천 기준값을 관리합니다. 고정 질문과 선택지는 MVP 동안 Backend 설정이 소유합니다.

## 구성

```text
data/
├─ prisma/schema.prisma
├─ prisma.config.ts
├─ migrations/
│  ├─ migration_lock.toml
│  └─ 20260728000100_initial/migration.sql
├─ seeds/
│  ├─ development.sql
│  └─ test.sql
├─ reference/VALUES.md
├─ .env.example
└─ HANDOFF.md
```

MVP 테이블은 `actors`, `recommendation_sessions`, `session_answers`, `foods`, `food_attributes`, `recommendation_results`, `recommendation_feedback`, `meal_logs`, `meal_log_photos`, `uploaded_files`입니다.

## 설계 원칙

- 모든 ID는 PostgreSQL `UUID`이며 `gen_random_uuid()`를 기본값으로 사용합니다.
- 모든 시각은 `TIMESTAMPTZ(3)`로 저장합니다. API에서는 ISO 8601 문자열로 변환합니다.
- DB 컬럼은 `snake_case`, Prisma 필드와 JSON은 `camelCase`, enum/기준값은 `UPPER_SNAKE_CASE`입니다.
- `recommendation_sessions.context`에는 양의 정수 `contextVersion`이 반드시 포함됩니다.
- 추천 결과마다 `context_snapshot`, `food_snapshot`, `score_breakdown`, `ruleset_version`을 보존합니다. 현재 음식 속성이 바뀌어도 당시 추천을 재구성할 수 있습니다.
- migration의 `CHECK` 제약은 JSON shape, 점수·rating 범위, 상태/완료 시각, 업로드 상태 등을 DB 수준에서 보강합니다. Prisma 스키마만으로 재생성하면 이 제약이 빠질 수 있으므로 적용된 migration은 수정하지 않습니다.

## 로컬 준비

Prisma 7.9 계열은 Node.js `20.19+`, `22.12+` 또는 `24+`가 필요합니다. PostgreSQL 15 이상과 `psql`을 권장합니다.

PowerShell 예시:

```powershell
Set-Location data
Copy-Item .env.example .env
npm.cmd install
npm.cmd run validate
npm.cmd run verify:sql
npm.cmd run migrate:deploy
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f seeds/development.sql
```

`.env`의 `DATABASE_URL`을 실제 개발 DB로 바꾼 뒤 실행합니다. migration은 `prisma.config.ts`의 `migrations.path`에 따라 `data/migrations`에서 읽습니다.

테스트 fixture는 개발 메뉴와 고정 test actor를 함께 넣습니다.

```powershell
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f seeds/test.sql
```

두 seed는 재실행할 수 있습니다. 개발 seed가 소유하는 24개 slug의 속성은 매 실행 시 기준값으로 교체되며, 다른 음식 행은 건드리지 않습니다.

## 검증

DB 접속 없이 Prisma 형식만 확인하려면 유효한 형식의 임시 URL을 사용할 수 있습니다.

```powershell
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/today_menu?schema=public'
npm.cmd run format
npm.cmd run validate
npx.cmd prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --config prisma.config.ts
npm.cmd run verify:sql
```

`migrate diff` 결과에는 Prisma가 표현하지 못하는 사용자 정의 `CHECK` 제약이 포함되지 않습니다. 배포 기준은 검토된 `migrations/**/migration.sql`입니다.

`verify:sql`은 PostgreSQL 호환 인메모리 엔진에서 초기 migration과 개발 seed를 두 번 실행하고, 24개 메뉴의 5개 속성 차원 커버리지와 대표 `CHECK` 제약을 확인합니다.

## 변경 규칙

- 적용된 migration은 수정하지 않고 새 timestamp 디렉터리를 추가합니다.
- enum이나 기준값 변경은 `reference/VALUES.md`를 먼저 갱신하고 호환성 영향을 기록합니다.
- Backend 또는 공통 계약 변경은 이 작업공간에서 직접 처리하지 않고 [HANDOFF.md](./HANDOFF.md)에 요청합니다.
