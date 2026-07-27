\ir development.sql

INSERT INTO "actors" (
  "id",
  "kind",
  "locale"
)
VALUES (
  '10000000-0000-4000-8000-000000000001',
  'GUEST',
  'ko-KR'
)
ON CONFLICT ("id") DO UPDATE SET
  "kind" = EXCLUDED."kind",
  "locale" = EXCLUDED."locale",
  "deleted_at" = NULL,
  "updated_at" = CURRENT_TIMESTAMP;
