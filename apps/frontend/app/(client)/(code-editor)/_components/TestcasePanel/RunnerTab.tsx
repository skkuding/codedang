'use client'

import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import './xterm.css'

interface RunnerTabProps {
  className?: string
}
export function RunnerTab({ className }: RunnerTabProps) {
  const { t } = useTranslate()
  return (
    <div
      className={cn(
        'relative m-3 h-4/5 w-auto rounded-lg bg-[#121728] px-4 py-3',
        className
      )}
      style={{ height: 'calc(100% - 5rem)' }}
    >
      <div className="absolute right-3 top-3 z-10">
        <Button size="sm">
          <a href="https://tally.so/r/wMVB9g" target="_blank">
            {t('give_us_feedback')}
          </a>
        </Button>
      </div>
      <div id="runner-container" className="h-full w-auto" />
    </div>
  )
}
