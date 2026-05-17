# TODO: 각 Terraform 루트/모듈의 terraform 블록에 required_version을 명시한 뒤 이 예외를 제거합니다.
rule "terraform_required_version" {
  enabled = false
}
