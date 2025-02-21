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
import { IoDuplicateOutline } from 'react-icons/io5'
import { PiTrashLight } from 'react-icons/pi'
import { toast } from 'sonner'
import { useDataTable } from '../../_components/table/context'

interface DuplicateCourseButtonProps<TData extends { id: number }, TPromise> {
  duplicateTarget: (id: number) => Promise<TPromise>
  onSuccess?: () => void
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
export function DuplicateCourseButton<TData extends { id: number }, TPromise>({
  onSuccess,
  duplicateTarget
}: DuplicateCourseButtonProps<TData, TPromise>) {
  const { table } = useDataTable<TData>()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDuplicateButtonClick = () => {
    if (table.getSelectedRowModel().rows.length === 0) {
      return
    }
    setIsDialogOpen(true)
  }

  const handleDuplicateRows = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const deletePromises = selectedRows.map((row) =>
      duplicateTarget(row.original.id)
    )

    try {
      await Promise.all(deletePromises)
      table.resetRowSelection()
      table.resetPageIndex()
      onSuccess?.()
    } catch {
      toast.error(`Failed to duplicate course`)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        type="button"
        onClick={handleDuplicateButtonClick}
      >
        <IoDuplicateOutline />
      </Button>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Course</AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-3">
              <div>
                <p className="text-gray-700">Contents that will be copied:</p>
                <ul className="ml-4 list-inside list-disc text-gray-700">
                  <li>Title</li>
                  <li>Description</li>
                  <li>Assignments</li>
                </ul>
                <p className="mt-2 text-red-500">
                  • Caution: The new contest will be set to be unpublished.
                </p>
                <p className="mt-2 text-gray-700">
                  Are you sure you want to duplicate the selected course?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleDuplicateRows}
                className="bg-primary hover:bg-primary-strong"
              >
                Duplicate
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
