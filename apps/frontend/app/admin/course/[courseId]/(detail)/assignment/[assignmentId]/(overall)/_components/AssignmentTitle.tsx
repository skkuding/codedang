'use client'

import { Skeleton } from '@/components/shadcn/skeleton'

interface AssignmentTitleProps {
  title?: string
  courseCode?: string
  courseTitle?: string
  courseSemester?: string
  isLoading?: boolean
}

export function AssignmentTitle({
  title,
  courseCode,
  courseTitle,
  courseSemester,
  isLoading = false
}: AssignmentTitleProps) {
  if (isLoading) {
    return <Skeleton className="h-10 w-80" />
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-4xl font-bold">{title}</span>
      <p className="text-body1_m_16 text-color-neutral-50">{`[${courseCode}] ${courseTitle} ㆍ ${courseSemester}`}</p>
    </div>
  )
}
