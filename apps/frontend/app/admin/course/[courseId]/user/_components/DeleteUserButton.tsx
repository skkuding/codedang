'use client'

import { useDataTable } from '@/app/admin/_components/table/context'
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
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { FaTrash } from 'react-icons/fa6'
import { toast } from 'sonner'

interface DeleteUserButtonProps<TPromise> {
  deleteTarget: (userId: number, groupId: number) => Promise<TPromise>
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
export function DeleteUserButton<TData extends { id: number }, TPromise>({
  deleteTarget,
  onSuccess
}: DeleteUserButtonProps<TPromise>) {
  const { table } = useDataTable<TData>()
  const params = useParams() // 경로에서 params 가져오기
  const groupId = Number(params.courseId) // 문자열이므로 숫자로 변환

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDeleteButtonClick = () => {
    if (table.getSelectedRowModel().rows.length === 0) {
      toast.error('Please select at least one member')
      return
    }
    setIsDialogOpen(true)
  }

  const handleDeleteRows = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const deletePromises = selectedRows.map((row) =>
      deleteTarget(row.original.id, groupId)
    )

    try {
      await Promise.all(deletePromises)
      table.resetRowSelection()
      table.resetPageIndex()
      onSuccess?.()
    } catch {
      toast.error(`Failed to delete user`)
    }
  }

  return (
    <>
      <Button variant="outline" type="button" onClick={handleDeleteButtonClick}>
        <FaTrash fontSize={13} color={'#8A8A8A'} />
      </Button>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete?</AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-3">
              <div>
                Are you sure you want to permanently delete{' '}
                {table.getSelectedRowModel().rows.length} users?
              </div>
              <div className="flex flex-col">
                {table.getSelectedRowModel().rows.map((row) => (
                  <span key={row.id}>- {row.getValue('name')}</span>
                ))}
              </div>
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
