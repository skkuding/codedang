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
import { capitalizeFirstLetter } from '@/libs/utils'
import { useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { FaCircleExclamation } from 'react-icons/fa6'
import { toast } from 'sonner'
import { useDataTable } from './context'

interface DataTableDeleteButtonProps<TData extends { id: number }, TPromise> {
  target: 'problem' | 'contest' | 'assignment' | 'group' | 'course'
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
export function DataTableDeleteButton<TData extends { id: number }, TPromise>({
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
        <FaTrash fontSize={13} color={'#8A8A8A'} />
      </Button>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="flex h-[304px] w-[432px] flex-col justify-between gap-6 p-10 shadow-lg sm:rounded-lg">
          <AlertDialogHeader className="flex flex-col gap-[14px]">
            <AlertDialogTitle>
              <div className="flex flex-col items-center justify-center gap-[24px]">
                <FaCircleExclamation color="#FF3B2F" size={50} />
                <p className="text-2xl font-medium">{`Delete ${capitalizeFirstLetter(target)}?`}</p>
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to permanently delete{' '}
              {table.getSelectedRowModel().rows.length} {target}(s)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="w-full border-[#80808040] text-sm font-bold text-[#3333334D]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleDeleteRows}
                className="w-full bg-[#FF3B2F] text-sm font-bold hover:bg-red-500/90"
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
