import { FileUploadSection } from './FileUploadSection'

export function ValidatorPage() {
  return (
    <FileUploadSection
      title="입력 검증"
      description="잘못된 테스트를 걸러내는 용도의 입력 제약조건 검증하세요"
      accept=".cpp"
      emptyMessages={[
        '업로드된 입력 검증 프로그램이 없습니다.',
        '기본 모드에서는 없이도 배포할 수 있으며, 커스텀 채점이 필요하면 추가해주세요.'
      ]}
    />
  )
}
