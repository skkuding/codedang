'use client'

import { Input } from '@/components/shadcn/input'
import type { Dispatch, SetStateAction } from 'react'

interface ModalInputPorps {
  type: string
  placeholder: string
  input: string
  setInput: Dispatch<SetStateAction<string>>
}

export function ModalInput({
  type,
  placeholder,
  input,
  setInput
}: ModalInputPorps) {
  return (
    <Input
      type={type}
      className="focus-visible:border-primary focus-visible:ring-0"
      placeholder={placeholder}
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
  )
}
