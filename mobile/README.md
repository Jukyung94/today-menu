# Mobile Workspace

React Native Community CLI와 TypeScript 기반 Android/iOS Today Menu 앱입니다.

## 소유 범위

- 수정 가능: `/mobile/**`
- 읽기 가능: 전체 저장소
- 수정 금지: `/web`, `/backend`, `/data`, 루트, `/docs`, `/packages`

공통 변경은 [HANDOFF.md](./HANDOFF.md)에 요청합니다.

## 현재 기반

- React Native `0.86.0`
- React `19.2.3`
- Community CLI `20.x`
- Android: Kotlin, min SDK 24, compile/target SDK 36
- iOS: Swift AppDelegate
- API base path: `/api/v1`

공식 Community CLI 템플릿을 임시 `/mobile/mobile-scaffold`에 생성한 뒤 이
디렉터리로 옮겼습니다. 생성 당시 사용한 명령은 다음과 같습니다.

```powershell
npx.cmd @react-native-community/cli@latest init TodayMenuMobile --directory mobile-scaffold --skip-git-init
```

생성된 공식 안내 원문은 [REACT_NATIVE_SETUP.md](./REACT_NATIVE_SETUP.md)에
보존되어 있습니다.

## 구조

```text
mobile/
├── android/                         # Kotlin Android 프로젝트
├── ios/                             # Swift iOS 프로젝트
├── src/
│   ├── api/                         # /api/v1 계약과 네트워크 경계
│   ├── app/                         # 앱 조립과 전역 provider
│   ├── design/                      # 모바일 디자인 토큰
│   └── features/
│       └── onboarding/              # Guest 진입 흐름
├── App.tsx                          # React Native 엔트리 컴포넌트
└── metro.config.js                  # @react-native/metro-config 기본 확장
```

UI 컴포넌트는 Web과 직접 공유하지 않습니다. API 타입, 도메인 규칙, 디자인
토큰만 공통화 후보로 취급합니다.

## 실행과 검증

Node.js `22.11.0` 이상과 JDK 17을 사용합니다.

```powershell
npm.cmd install
npm.cmd run lint
npm.cmd test -- --runInBand
npx.cmd tsc --noEmit
npm.cmd run android
```

Metro만 실행하려면 `npm.cmd start`를 사용합니다.

## Windows Android 준비

Android Studio의 SDK Manager에서 아래 항목을 설치해야 합니다.

- Android SDK Platform 36
- Android SDK Build-Tools 36.0.0
- Android SDK Platform-Tools
- Android SDK Command-line Tools
- Android Emulator(에뮬레이터를 사용할 경우)

그다음 사용자 환경 변수 `ANDROID_HOME`을 Android SDK 디렉터리(일반적으로
`%LOCALAPPDATA%\Android\Sdk`)로 지정하고 `%ANDROID_HOME%\platform-tools`를
`Path`에 추가합니다. 새 터미널에서 `adb --version`이 성공하는지 확인한 뒤
`npm.cmd run android`를 실행합니다.

iOS 빌드는 macOS, Xcode와 CocoaPods가 필요합니다. Windows에서는
`ios/TodayMenuMobile.xcodeproj`, Swift AppDelegate와 Podfile의 정적 구성만
확인합니다.

## MVP 진행 순서

1. 진입·Guest 시작
2. 추천 모드 선택
3. 서버 주도 질문·답변과 진행률
4. 추천 결과 3개
5. 추천 피드백
6. 식사 기록과 사진 선택
7. 기록 목록

현재 첫 단계는 공식 네이티브 프로젝트 초기화, Today Menu 앱 셸, Guest 시작
화면, API 계약 타입과 디자인 토큰 경계까지 구성한 상태입니다.
