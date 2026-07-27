# Prisma

`schema.prisma`는 애플리케이션 모델의 기준입니다. DB 연결 URL과 migration 경로는 Prisma 7 방식으로 상위 `prisma.config.ts`에서 관리합니다.

생성 클라이언트의 기본 출력은 `data/generated/client`이며 Git에 포함하지 않습니다. Backend 런타임에서 사용할 때는 같은 Prisma 버전으로 생성하고 PostgreSQL driver adapter를 Backend 의존성에 선언해야 합니다. 자세한 연동 요청은 `data/HANDOFF.md`를 참고합니다.

Prisma가 표현하지 못하는 세밀한 `CHECK` 제약은 초기 migration에 직접 추가했습니다. 스키마와 migration의 테이블·컬럼·관계는 함께 유지하되, migration을 schema에서 무검토 재생성하지 않습니다.
