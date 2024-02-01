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
import type { ProblemDetail } from '@/types/type'
import { TbReload } from 'react-icons/tb'

interface ProblemEditorProps {
  data: ProblemDetail
  langValue: string | undefined
}

export default function Editor({ data, langValue }: ProblemEditorProps) {
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
        <Button
          className="bg-primary h-7 shrink-0 rounded-md px-2 font-semibold"
          onClick={async () => {
            const res = await fetcherWithAuth.post('submission', {
              json: {
                language: langValue,
                code: [
                  {
                    id: 1,
                    text: '#include <stdio.h>\nint main() { int a, b; scanf("%d%d", &a, &b); printf("%d\\n", a + b);}',
                    locked: false
                  }
                ]
              },
              searchParams: {
                problemId: data.id // 문제 ID
              }
            })
            const submission = await res.json()
            return submission
          }}
        >
          Submit
        </Button>
        <SelectScrollable languages={data.languages} />
      </div>
    </div>
  )
}
