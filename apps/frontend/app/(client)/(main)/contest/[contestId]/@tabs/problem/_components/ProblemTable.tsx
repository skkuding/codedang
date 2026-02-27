'use client'

import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import type { ContestProblem } from '@/types/type'
import { useTranslate } from '@tolgee/react'
import { useMemo } from 'react'
import { getColumns } from './Columns'

export function ProblemTable({ problems }: { problems: ContestProblem[] }) {
  const { t } = useTranslate()
  const columns = useMemo(() => getColumns(t), [t])
  return (
    <DataTable
      data={problems}
      columns={columns}
      headerStyle={{
        order: 'w-[8%] ',
        title: 'text-left w-[50%]',
        submit: 'w-[11%]',
        submissionTime: 'w-[20%]',
        score: 'w-[11%]'
      }}
      linked
    />
  )
}
