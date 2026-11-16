# Sentry

sentry.io의 `skkuding` 조직을 관리하는 Terraform입니다. 팀, 프로젝트,
DSN(클라이언트 키), 알림 규칙, 업타임 모니터를 여기서 정의합니다.

## 토큰

공급자는 `SENTRY_AUTH_TOKEN` 환경변수에서 토큰을 읽습니다. 실행하는 사람마다
`terraform` Internal Integration에서 자기 토큰을 발급해 `.envrc.local`에 둡니다
(레포 루트의 `.envrc.local.example` 참고). 토큰은 주고받지 않고, 그만둔 사람의
토큰은 Sentry 화면에서 끕니다.

S3 백엔드(`codedang-tf-state` 버킷)를 쓰므로 AWS 자격 증명도 필요합니다.

## Terraform 밖에서 관리하는 것

Sentry API로 만들 수 없어서 Sentry 화면에서 직접 설정합니다.

- 조직 자체. Terraform은 data source로 읽기만 하므로, 어떤 plan도 조직과
  후원 플랜을 지울 수 없습니다.
- 조직 멤버와 역할. Integration 토큰으로는 멤버를 관리할 수 없습니다.
- `terraform` Internal Integration과 그 토큰
- Discord·GitHub 연동. Terraform은 설치된 연동을 조회만 할 수 있습니다.
- 소스맵 업로드용 CI 토큰, 장애 진단 에이전트용 읽기 전용 토큰

## 출력값

`frontend_dsn`은 프론트엔드 SDK가 쓰는 공개 DSN입니다. 브라우저 번들에
그대로 들어가는 값이라 비밀이 아닙니다.
