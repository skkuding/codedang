# Sentry

sentry.io `skkuding` 조직의 설정(팀, 프로젝트, DSN, 알림)을 Terraform으로 관리합니다.

## 실행 전 준비

- **`TF_VAR_sentry_token`**: Sentry의 `terraform` Internal Integration에서 본인 토큰을 발급받아 `.envrc.local`에 넣으세요. 방법은 루트의 `.envrc.local.example`에 있습니다.
  - 토큰은 사람마다 따로 발급합니다. 공유하지 말고, 그만둔 사람의 토큰은 Sentry에서 삭제하세요.
- **AWS 자격 증명**: state가 S3(`codedang-tf-state`)에 있습니다.

## Sentry 화면에서 직접 설정하는 것

- **조직**: Terraform에서는 조회만 합니다. 실수로 조직이 삭제되는 일을 막기 위해서입니다.
- **멤버와 권한**: Integration 토큰으로는 멤버를 관리할 수 없습니다.
- **`terraform` Internal Integration과 토큰**
- **Discord·GitHub 연동 설치**: Terraform에서는 설치된 연동을 조회만 할 수 있습니다.
- **소스맵 업로드용 CI 토큰, 장애 진단 에이전트용 읽기 전용 토큰**

## Output

- `frontend_dsn`: 프론트엔드 SDK가 쓰는 공개 DSN입니다. 브라우저 번들에 그대로 들어가는 값이라 비밀이 아닙니다.
