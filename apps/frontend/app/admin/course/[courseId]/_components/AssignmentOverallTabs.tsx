'use client'

import { cn } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AssignmentOverallTabsProps {
  groupId: number
  assignmentId: number
  isExercise?: boolean
}

export function AssignmentOverallTabs({
  groupId,
  assignmentId,
  isExercise
}: AssignmentOverallTabsProps) {
  const pathname = usePathname()
  const { t } = useTranslate()

  const isCurrentTab = (tab: string) => {
    const basePath = `/admin/course/${groupId}/${isExercise ? 'exercise' : 'assignment'}/${assignmentId}`
    const currentPath = tab ? `${basePath}/${tab}` : basePath
    return pathname === currentPath
  }

  return (
    <div className="flex w-full border-b border-[#E1E1E1]">
      <Link
        href={
          `/admin/course/${groupId}/${isExercise ? 'exercise' : 'assignment'}/${assignmentId}` as const
        }
        className={cn(
          'flex h-12 flex-1 items-center justify-center font-semibold',
          isCurrentTab('')
            ? 'border-b-2 border-[#3581FA] text-[#3581FA]'
            : 'text-[#737373]'
        )}
      >
        {t('information_tab')}
      </Link>
      <Link
        href={
          `/admin/course/${groupId}/${isExercise ? 'exercise' : 'assignment'}/${assignmentId}/submission` as const
        }
        className={cn(
          'flex h-12 flex-1 items-center justify-center font-semibold',
          isCurrentTab('submission')
            ? 'border-b-2 border-[#3581FA] text-[#3581FA]'
            : 'text-[#737373]'
        )}
      >
        {t('submission_tab')}
      </Link>
      {!isExercise && (
        <Link
          href={
            `/admin/course/${groupId}/assignment/${assignmentId}/assessment` as const
          }
          className={cn(
            'flex h-12 flex-1 items-center justify-center font-semibold',
            isCurrentTab('assessment')
              ? 'border-b-2 border-[#3581FA] text-[#3581FA]'
              : 'text-[#737373]'
          )}
        >
          {t('assessment_tab')}
        </Link>
      )}
    </div>
  )
}
