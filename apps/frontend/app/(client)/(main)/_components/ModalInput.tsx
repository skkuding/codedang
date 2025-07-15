'use client'

import { Input } from '@/components/shadcn/input'
import type { InputProps } from './Modal'

export function ModalInput({ type, placeholder, value, onChange }: InputProps) {
  return (
    <Input
      type={type}
      className="focus-visible:border-primary focus-visible:ring-0"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
