'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/shadcn/alert-dialog'
import { Button } from '@/components/shadcn/button'
import { useState } from 'react'
import { PiTrashLight } from 'react-icons/pi'
import { toast } from 'sonner'
import { useDataTable } from './context'

interface DataTableDeleteButtonProps<TData extends { id: number }, TPromise> {
  target: 'problem' | 'contest'
  deleteTarget: (id: number) => Promise<TPromise>
  getCanDelete?: (selectedRows: TData[]) => Promise<boolean>
  onSuccess?: () => void
  className?: string
}

/**
 * 어드민 테이블의 삭제 버튼 컴포넌트
 * @desctiption 선택된 행들을 삭제하는 기능
 * @param target
 * 삭제 대상 (problem or contest)
 * @param deleteTarget
 * 아이디를 전달받아 삭제 요청하는 함수
 * @param getCanDelete
 * 선택된 행들이 삭제 가능한지를 반환하는 함수
 * @param onSuccess
 * 삭제 성공 시 호출되는 함수
 * @param className
 * tailwind 클래스명
 */
export default function DataTableDeleteButton<
  TData extends { id: number },
  TPromise
>({
  target,
  deleteTarget,
  getCanDelete,
  onSuccess,
  className
}: DataTableDeleteButtonProps<TData, TPromise>) {
  const { table } = useDataTable<TData>()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDeleteButtonClick = async () => {
    if (table.getSelectedRowModel().rows.length === 0) {
      return
    }

    if (!getCanDelete) {
      setIsDialogOpen(true)
      return
    }

    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original)

    const canDelete = await getCanDelete(selectedRows)
    if (canDelete) {
      setIsDialogOpen(true)
    }
  }

  const handleDeleteRows = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const deletePromises = selectedRows.map((row) =>
      deleteTarget(row.original.id)
    )

    try {
      await Promise.all(deletePromises)
      table.resetRowSelection()
      table.resetPageIndex()
      onSuccess?.()
    } catch {
      toast.error(`Failed to delete ${target}`)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        type="button"
        onClick={handleDeleteButtonClick}
        className={className}
      >
        <PiTrashLight fontSize={18} />
      </Button>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{' '}
              {table.getSelectedRowModel().rows.length} {target}(s)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleDeleteRows}
                className="bg-red-500 hover:bg-red-500/90"
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
