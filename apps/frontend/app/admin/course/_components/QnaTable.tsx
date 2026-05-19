'use client'

import {
  DataTable,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar,
  DataTableFallback
} from '@/app/admin/_components/table'
import { Button } from '@/components/shadcn/button'
import { GET_COURSE } from '@/graphql/course/queries'
import { GET_COURSE_QNAS } from '@/graphql/qna/queries'
import { cn } from '@/libs/utils'
import { useSuspenseQuery } from '@apollo/client'
import { useState } from 'react'
import { QnaDetailModal } from './QnaDetailModal'
import { columns } from './QnaTableColumns'
import type { DataTableQna } from './QnaTableColumns'

interface QnaTableProps {
  groupId: string
}

export function QnaTable({ groupId }: QnaTableProps) {
  const [activeTab, setActiveTab] = useState('General')
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null)

  const { data: qnaData } = useSuspenseQuery(GET_COURSE_QNAS, {
    variables: {
      groupId: Number(groupId)
    }
  })

  const { data: course } = useSuspenseQuery(GET_COURSE, {
    variables: {
      groupId: Number(groupId)
    }
  })

  const qnas: DataTableQna[] = qnaData.getCourseQnAs
    .map((qna) => ({
      ...qna,
      id: Number(qna.id),
      courseTitle: course.getCourse.groupName,
      createdBy: {
        username: qna.createdBy?.username ? qna.createdBy.username : 'Unknown'
      }
    }))
    .filter((qna) => {
      if (activeTab === 'General') {
        return qna.category === 'General'
      } else if (activeTab === 'Problem') {
        return qna.category === 'Problem'
      }
    })

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  return (
    <DataTableRoot
      data={qnas}
      columns={columns}
      defaultSortState={[{ id: 'createTime', desc: true }]}
    >
      <div className="mb-4 flex w-full items-center justify-between">
        <div className="flex gap-5">
          <div className="flex items-center gap-2">
            <span className="text-primary text-[30px] font-extrabold">
              {qnas.length}
            </span>
            <span className="text-[26px] font-semibold text-black">
              {qnas.length <= 1 ? 'Question' : 'Questions'}
            </span>
          </div>
          <div className="bg-color-commmon-100 border-line flex rounded-full border p-[5px]">
            {['General', 'Problem'].map((tab) => (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'h-9 w-[190px] flex-1 py-2 text-base font-normal',
                  activeTab === tab
                    ? 'bg-primary border-primary text-white hover:border-blue-600'
                    : 'bg-color-commmon-100 hover:bg-color-neutral-99 text-[#808080]'
                )}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>
        <DataTableSearchBar
          columndId="title"
          sizeVariant="lg"
          className="w-[350px]"
        />
      </div>
      <DataTable
        getHref={undefined}
        onRowClick={(_, row) => {
          const item = row.original as DataTableQna
          setOpen(true)
          setTitle(item.title)
          setSelectedOrder(item.order)
        }}
      />
      <DataTablePagination showSelection />

      <QnaDetailModal
        open={open}
        onOpenChange={setOpen}
        title={title}
        order={selectedOrder}
      />
    </DataTableRoot>
  )
}

export function QnaTableFallback() {
  return <DataTableFallback columns={columns} />
}
