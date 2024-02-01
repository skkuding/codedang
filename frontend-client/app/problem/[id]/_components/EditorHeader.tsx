'use client'

import SelectScrollable from '@/app/problem/[id]/_components/SelectScrollable'
import { Button } from '@/components/ui/button'
import { fetcherWithAuth } from '@/lib/utils'
import type { ProblemDetail } from '@/types/type'
import { TbReload } from 'react-icons/tb'

interface ProblemEditorProps {
  data: ProblemDetail
  langValue: string | undefined
}

export default function Editor({ data, langValue }: ProblemEditorProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-b-slate-700 bg-slate-800 px-5">
      <div className="cursor-pointer text-lg font-bold">Editor</div>
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          className="size-7 shrink-0 rounded-md bg-slate-600 hover:bg-slate-700"
        >
          <TbReload className="size-4" />
        </Button>
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
