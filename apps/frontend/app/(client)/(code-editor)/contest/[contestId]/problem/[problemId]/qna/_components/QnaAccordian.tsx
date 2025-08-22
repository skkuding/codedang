'use client'

import { Accordion } from '@/components/shadcn/accordion'
import type { SingleQnaData } from '@/types/type'

interface QnaAccordianProps {
  qnaData: SingleQnaData
}

export function QnaAccordian(qnaData: QnaAccordianProps) {
  console.log('QnA Data:', qnaData)
  return <div>{/* Your QnA Accordion component implementation */}</div>
}
