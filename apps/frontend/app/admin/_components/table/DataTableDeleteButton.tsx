'use client'

import { AlertModal } from '@/components/AlertModal'
import { ModalList } from '@/components/ModalList'
import { Button } from '@/components/shadcn/button'
import { useTranslate } from '@tolgee/react'
import { useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { toast } from 'sonner'
import { useDataTable } from './context'

interface DataTableDeleteButtonProps<TData extends { id: number }, TPromise> {
  target:
    | 'problem'
    | 'contest'
    | 'assignment'
    | 'exercise'
    | 'group'
    | 'course'
    | 'user'
  deleteTarget: (id: number, extra?: number) => Promise<TPromise>
  extraArg?: number // 현재는 groupId만 사용되고 있음
  getCanDelete?: (selectedRows: TData[]) => Promise<boolean>
  onSuccess?: () => void
  className?: string
  deleteItems?: string[]
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
 * @param extraArg
 * deleteTarget의 row.original.id 외에 필요한 다른 매개변수
 */
export function DataTableDeleteButton<TData extends { id: number }, TPromise>({
  target,
  deleteTarget,
  extraArg,
  getCanDelete,
  onSuccess,
  className,
  deleteItems
}: DataTableDeleteButtonProps<TData, TPromise>) {
  const { t } = useTranslate()
  const { table } = useDataTable<TData>()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDeleteButtonClick = async () => {
    if (table.getSelectedRowModel().rows.length === 0) {
      toast.error(t('select_at_least_one', { target }))
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
      deleteTarget(row.original.id, extraArg)
    )

    try {
      await Promise.all(deletePromises)
      table.resetRowSelection()
      table.resetPageIndex()
      onSuccess?.()
    } catch {
      toast.error(t('failed_to_delete', { target }))
    }
  }

  return (
    <AlertModal
      trigger={
        <Button
          variant="outline"
          type="button"
          onClick={handleDeleteButtonClick}
          className={className}
        >
          <FaTrash fontSize={13} color={'#8A8A8A'} />
        </Button>
      }
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      type={'warning'}
      showIcon={!deleteItems}
      title={t('delete_target_title', { target })}
      primaryButton={{
        text: t('delete_button'),
        onClick: handleDeleteRows
      }}
      {...(deleteItems
        ? {}
        : {
            description: t('confirm_permanent_delete', {
              count: table.getSelectedRowModel().rows.length,
              target
            })
          })}
    >
      {deleteItems && <ModalList items={deleteItems} />}
    </AlertModal>
  )
}
