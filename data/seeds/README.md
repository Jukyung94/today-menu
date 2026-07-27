# Seeds

- `development.sql`: 규칙 기반 추천 검증용 합성 메뉴 24개와 음식 속성
- `test.sql`: 개발 메뉴를 먼저 적용하고 UUID가 고정된 test actor 추가

`psql`의 `ON_ERROR_STOP`을 켜서 중간 실패 시 성공으로 오인하지 않도록 실행합니다.

```powershell
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f seeds/development.sql
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f seeds/test.sql
```

개발 seed는 transaction 안에서 실행되며 동일 slug를 upsert합니다. 해당 24개 메뉴의 속성만 기준 상태로 교체하므로 재실행 가능합니다.

메뉴와 속성은 프로젝트 내부에서 직접 작성한 합성 데이터입니다. 외부 데이터셋을 복사하지 않았고, 가격은 실제 시세가 아니라 예산 규칙의 경계 검증용 예시값입니다.
