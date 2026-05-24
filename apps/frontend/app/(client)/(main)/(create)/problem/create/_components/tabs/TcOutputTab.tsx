'use client'

import { FileUpload } from '@/app/(client)/(main)/(create)/problem/create/_components/FileUpload'
import { useState } from 'react'

function TcOutputCard1() {
  const [, setFiles] = useState<File[]>([])
  return (
    <FileUpload
      multiple
      primaryText="업로드 된 테스트 생성 파일이 없습니다."
      secondaryText=".out 자동 생성이 필요하면 추가해주세요."
      onFilesChange={setFiles}
    />
  )
}

function TcOutputCard2() {
  return <div>TC 아웃풋 생성 second div content</div>
}

function TcOutputCard3() {
  return <div>TC 아웃풋 생성 third div content</div>
}

export const TcOutputTab = {
  value: 'tc-output' as const,
  label: 'TC 아웃풋 생성',
  cards: [TcOutputCard1, TcOutputCard2, TcOutputCard3]
}
