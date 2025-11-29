'use client'

import { useDataTable } from '@/app/admin/_components/table/context'
import { Button } from '@/components/shadcn/button'
import { FiDownload } from 'react-icons/fi'
import { toast } from 'sonner'

const ADMIN_REST_URL = process.env.NEXT_PUBLIC_ADMIN_REST_URL

type Row = { id: number }

export function ProblemsDownload() {
  const { table } = useDataTable<Row>()

  const handleDownload = () => {
    const rows = table.getSelectedRowModel().rows

    if (!rows.length) {
      toast.error('Please select at least one problem.')
      return
    }

    rows.forEach((row) => {
      const problemId = row.original.id
      const url = `${ADMIN_REST_URL}/problem/download/${problemId}`

      const a = document.createElement('a')
      a.href = url
      a.download = `codedang-problem-${problemId}.json`
      a.rel = 'noopener'
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    })
  }

  return (
    <Button
      type="button"
      onClick={handleDownload}
      className="ml-auto flex items-center justify-center"
    >
      <FiDownload className="h-4 w-4 shrink-0" />
    </Button>
  )
}
