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
import { useTranslate } from '@tolgee/react'
import { toast } from 'sonner'

interface LoadButtonProps {
  code: string
}

export function LoadButton({ code }: LoadButtonProps) {
  const setCode = useCodeStore((s) => s.setCode)
  const { t } = useTranslate()

  const LoadSubmissionCode = () => {
    setCode(code)
    toast.success(t('submission_code_loaded_successfully'))
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="size-7 h-8 w-[77px] shrink-0 gap-[5px] rounded-[4px] bg-slate-600 font-normal text-white hover:bg-slate-700">
          {t('load_button')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-[200px] w-[500px] rounded-2xl border border-slate-800 bg-slate-900 pb-7 pl-8 pr-[30px] pt-8 sm:rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-size-5 text-slate-50">
            {t('load_submission_code_title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-size-4 text-slate-300">
            {t('load_submission_code_warning')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel className="self-end rounded-[1000px] border-none bg-[#DCE3E5] text-[#787E80] hover:bg-[#c9cfd1]">
            {t('cancel_button')}
          </AlertDialogCancel>
          <AlertDialogAction
            className="self-end rounded-[1000px] bg-red-500 hover:bg-red-600"
            onClick={LoadSubmissionCode}
          >
            {t('load_button')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
