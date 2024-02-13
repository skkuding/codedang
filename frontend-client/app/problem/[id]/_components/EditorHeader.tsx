'use client'

import SelectScrollable from '@/app/problem/[id]/_components/SelectScrollable'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import useEditorStore from '@/stores/editor'
import type { ProblemDetail } from '@/types/type'
import { TbReload } from 'react-icons/tb'
import SubmitButton from './SubmitButton'

interface ProblemEditorProps {
  data: ProblemDetail
}

export default function Editor({ data }: ProblemEditorProps) {
  const { clearCode } = useEditorStore()
  return (
    <div className="flex shrink-0 items-center justify-end border-b border-b-slate-700 bg-slate-800 px-5">
      <div className="flex items-center gap-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              className="size-7 shrink-0 rounded-md bg-slate-600 hover:bg-slate-700"
            >
              <TbReload className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border border-slate-700 bg-slate-900">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-50">
                Clear code
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Are you sure you want to clear your code?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2">
              <AlertDialogAction onClick={clearCode}>Clear</AlertDialogAction>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <SubmitButton problemId={data.id} />
        <SelectScrollable languages={data.languages} />
      </div>
    </div>
  )
}
