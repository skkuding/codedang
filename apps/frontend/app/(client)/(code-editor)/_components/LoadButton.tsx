'use client'

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
} from '@/components/shadcn/alert-dialog'
import { Button } from '@/components/shadcn/button'
import { useCodeStore } from '@/stores/editor'
import { toast } from 'sonner'

interface LoadButtonProps {
  code: string
}

export function LoadButton({ code }: LoadButtonProps) {
  const setCode = useCodeStore((s) => s.setCode)

  const LoadSubmissionCode = () => {
    setCode(code)
    toast.success('Submission code loaded successfully!')
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="size-7 h-8 w-[77px] shrink-0 gap-[5px] rounded-[4px] bg-slate-600 font-normal text-white hover:bg-slate-700">
          Load
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-[200px] w-[500px] rounded-2xl border border-slate-800 bg-slate-900 pb-7 pl-8 pr-[30px] pt-8 sm:rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-size-5 text-slate-50">
            Load submission code
          </AlertDialogTitle>
          <AlertDialogDescription className="font-size-4 text-slate-300">
            Your current code will be lost if you load the submission.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel className="self-end rounded-[1000px] border-none bg-[#DCE3E5] text-[#787E80] hover:bg-[#c9cfd1]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="self-end rounded-[1000px] bg-red-500 hover:bg-red-600"
            onClick={LoadSubmissionCode}
          >
            Load
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
