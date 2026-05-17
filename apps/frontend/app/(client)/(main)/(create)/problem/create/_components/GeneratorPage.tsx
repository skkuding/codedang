import { FileUploadSection } from './FileUploadSection'

export function GeneratorPage() {
  return (
    <FileUploadSection
      title="테스트 생성"
      description="테스트 입력을 생성하는 프로그램 및 스크립트를 업로드하세요"
      accept=".cpp, .py"
      emptyMessages={[
        '업로드 된 테스트 생성 프로그램이 없습니다.',
        '커스텀 채점이 필요하면 추가해주세요.'
      ]}
    />
  )
}
