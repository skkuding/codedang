'use client'

import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import type { ContestAnnouncement } from '@/types/type'
import { useTranslate } from '@tolgee/react'
import { useMemo } from 'react'
import { getColumns } from './Columns'

export function AnnouncementTable({
  contestAnnouncements
}: {
  contestAnnouncements: ContestAnnouncement[]
}) {
  const { t } = useTranslate()
  const columns = useMemo(() => getColumns(t), [t])
  return (
    <DataTable
      data={contestAnnouncements}
      columns={columns}
      headerStyle={{
        no: 'text-[#808080b3] font-normal w-[9%]',
        problem: 'text-[#808080b3] font-normal w-[15%]',
        content: 'text-[#808080b3] font-normal w-[51%]',
        createTime: 'text-[#808080b3] font-normal w-[25%]'
      }}
      tableRowStyle="hover:bg-white cursor-auto"
    />
  )
}
