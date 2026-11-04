import { cn } from '@/libs/utils'
import type { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  description: string
  actions: ReactNode
  headerClassName?: string
  children?: ReactNode
}

export function SectionCard({
  title,
  description,
  actions,
  headerClassName,
  children
}: SectionCardProps) {
  return (
    <section className="flex flex-col gap-5 rounded-[16px] bg-white px-6 py-7">
      <div className="flex items-center justify-between gap-3">
        <div className={cn('flex flex-col gap-1', headerClassName)}>
          <h2 className="text-head5_sb_24">{title}</h2>
          <p className="text-body1_m_16 text-color-cool-neutral-40">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      </div>
      {children}
    </section>
  )
}
