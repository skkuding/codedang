'use client'

import {
  DataTable,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar,
  DataTableFallback
} from '@/app/admin/_components/table'
import { Modal } from '@/components/Modal'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { GET_ASSIGNMENTS } from '@/graphql/assignment/queries'
import { useSuspenseQuery } from '@apollo/client'
import { useState } from 'react'
import { columns } from './QnaTableColumns'

interface QnaTableProps {
  groupId: string
  isExercise?: boolean
}

export function QnaTable({ groupId, isExercise = false }: QnaTableProps) {
  const { data } = useSuspenseQuery(GET_ASSIGNMENTS, {
    variables: {
      groupId: Number(groupId),
      take: 300,
      isExercise
    }
  })

  const assignments = data.getAssignments.map((assignment) => ({
    ...assignment,
    id: Number(assignment.id)
  }))

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  return (
    <DataTableRoot
      data={assignments}
      columns={columns}
      defaultSortState={[{ id: 'startTime', desc: true }]}
    >
      <DataTableSearchBar columndId="title" />
      <DataTable
        getHref={undefined}
        onRowClick={(_, row) => {
          setOpen(true)
          setTitle(row.getValue('description'))
        }}
      />
      <DataTablePagination showSelection />

      <ScrollArea>
        <Modal
          type="custom"
          open={open}
          onOpenChange={setOpen}
          size="lg"
          title={title}
        >
          writer :
        </Modal>
      </ScrollArea>
    </DataTableRoot>
  )
}

export function AssignmentTableFallback() {
  return <DataTableFallback columns={columns} />
}
