import type { ReactNode } from 'react'

export interface ModalListProps {
  children: ReactNode
}

export function ModalList({ children }: ModalListProps) {
  return (
    <div className="bg-background-alternative h-full w-full overflow-y-auto px-[12px] py-[14px]">
      {children}
    </div>
  )
}
