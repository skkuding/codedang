import { FileUploadSection } from './FileUploadSection'

export function CheckerPage() {
  return (
    <FileUploadSection
      title="특수 채점"
      description="부동소수 오차, 특수 채점 등의 출력 비교 로직을 업로드 해주세요"
      accept=".cpp"
      emptyMessages={[
        '업로드된 특수 채점 프로그램이 없습니다.',
        '기본 모드에서는 없이도 배포할 수 있으며, 커스텀 채점이 필요하면 추가해주세요.'
      ]}
    />
  )
}
