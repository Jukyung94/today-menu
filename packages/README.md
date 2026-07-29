# Shared Packages

이 경로는 Coordinator가 관리합니다. Web, Mobile, Backend, Data 작업공간은 직접 수정하지 않고 각자의 `HANDOFF.md`에 변경을 요청합니다.

향후 다음 패키지를 둡니다.

```text
packages/
├─ api-client/      OpenAPI로 생성한 Web/Mobile 공통 클라이언트
├─ domain/          공통 enum과 순수 도메인 타입
└─ config/          공통 TypeScript 및 품질 설정
```

React Native Community CLI의 Metro 및 네이티브 빌드 안정성을 먼저 확인한 뒤 필요한 패키지만 추가합니다.
