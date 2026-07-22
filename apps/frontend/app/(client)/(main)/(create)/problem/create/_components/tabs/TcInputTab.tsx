'use client'

import { FileUpload } from '@/app/(client)/(main)/(create)/problem/create/_components/FileUpload'
import { useState } from 'react'

function TcInputCard1() {
  const [, setFiles] = useState<File[]>([])
  return (
    <FileUpload
      multiple
      primaryText="업로드 된 테스트 생성 파일이 없습니다."
      secondaryText=".in 자동 생성이 필요하면 추가해주세요."
      onFilesChange={setFiles}
    />
  )
}

function TcInputCard2() {
  return <div>TC 인풋 생성 second div content</div>
}

export const TcInputTab = {
  value: 'tc-input' as const,
  label: 'TC 인풋 생성',
  cards: [TcInputCard1, TcInputCard2]
}
