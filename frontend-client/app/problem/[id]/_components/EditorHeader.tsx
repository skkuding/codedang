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
import { fetcherWithAuth } from '@/lib/utils'
import useEditorStore from '@/stores/editor'
import type { ProblemDetail, Submission } from '@/types/type'
import { useRouter } from 'next/navigation'
import { TbReload } from 'react-icons/tb'
import { toast } from 'sonner'

interface ProblemEditorProps {
  data: ProblemDetail
  langValue: string | undefined
}

export default function Editor({ data, langValue }: ProblemEditorProps) {
  const { clearCode, code } = useEditorStore()
  const router = useRouter()
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
        <Button
          className="h-7 shrink-0 rounded-md px-2"
          onClick={async () => {
            if (code === '') {
              toast.error('Please write your code.')
              return
            }
            const res = await fetcherWithAuth.post('submission', {
              json: {
                language: langValue,
                code: [
                  {
                    id: 1,
                    text: code,
                    locked: false
                  }
                ]
              },
              searchParams: {
                problemId: data.id // 문제 ID
              },
              next: {
                revalidate: 0
              }
            })
            if (res.ok) {
              const submission: Submission = await res.json()
              router.push(`/problem/${data.id}/submission/${submission.id}`)
            } else {
              if (res.status === 401) {
                toast.error('If you want to submit, please login.')
              } else {
                toast.error('Please try again later.')
              }
            }
          }}
        >
          Submit
        </Button>
        <SelectScrollable languages={data.languages} />
      </div>
    </div>
  )
}
