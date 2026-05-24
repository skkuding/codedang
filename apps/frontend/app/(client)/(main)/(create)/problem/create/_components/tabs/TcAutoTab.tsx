'use client'

import { FileUpload } from '@/app/(client)/(main)/(create)/problem/create/_components/FileUpload'
import { useState } from 'react'

function TcAutoCard1() {
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

function TcAutoCard2() {
  return <div>TC 자동 생성 second div content</div>
}

function TcAutoCard3() {
  return <div>TC 자동 생성 third div content</div>
}

function TcAutoCard4() {
  return <div>TC 자동 생성 fourth div content</div>
}

export const TcAutoTab = {
  value: 'tc-auto' as const,
  label: 'TC 자동 생성',
  cards: [TcAutoCard1, TcAutoCard2, TcAutoCard3, TcAutoCard4]
}
