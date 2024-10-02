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
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
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

  return table.getSelectedRowModel().rows.length !== 0 ? (
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
  ) : (
    <Button variant="outline" type="button" className={className}>
      <PiTrashLight fontSize={18} />
    </Button>
  )
}
