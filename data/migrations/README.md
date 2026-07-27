# Migrations

Prisma가 timestamp 이름 순서로 적용하는 PostgreSQL migration을 관리합니다.

- `20260728000100_initial/migration.sql`: MVP 10개 테이블, enum, index, FK, JSON/범위/상태 `CHECK` 제약
- `migration_lock.toml`: PostgreSQL provider 고정

적용:

```powershell
Set-Location data
npm.cmd run migrate:deploy
```

운영·공유 DB에는 `prisma migrate dev`를 사용하지 않습니다. 이미 적용된 디렉터리는 수정하지 말고 후속 timestamp migration을 추가합니다.
