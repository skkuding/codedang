'use client'

import { AlertModal } from '@/components/AlertModal'
import { ModalList } from '@/components/ModalList'
import { Button } from '@/components/shadcn/button'
import { useState, type ReactNode } from 'react'
import { FaTrash } from 'react-icons/fa'
import { toast } from 'sonner'
import { useDataTable } from './context'

interface DataTableDeleteButtonProps<TData extends { id: number }, TPromise> {
  target: 'problem' | 'contest' | 'assignment' | 'exercise' | 'group' | 'course'
  deleteTarget: (id: number) => Promise<TPromise>
  getCanDelete?: (selectedRows: TData[]) => Promise<boolean>
  onSuccess?: () => void
  className?: string
  children?: ReactNode
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
  className,
  children
}: DataTableDeleteButtonProps<TData, TPromise>) {
  const { table } = useDataTable<TData>()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDeleteButtonClick = async () => {
    if (table.getSelectedRowModel().rows.length === 0) {
      toast.error(`Please select at least one ${target}`)
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
      <AlertModal
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        type={'warning'}
        showWarningIcon={!children}
        title={`Delete ${target}?`}
        primaryButton={{
          text: 'Delete',
          onClick: handleDeleteRows
        }}
        {...(children
          ? {}
          : {
              description: `Are you sure you want to permanently delete ${table.getSelectedRowModel().rows.length} ${target}(s)?`
            })}
      >
        {children && <ModalList>{children}</ModalList>}
      </AlertModal>
    </>
  )
}
