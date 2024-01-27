import SelectScrollable from '@/app/problem/[id]/_components/SelectScrollable'
import { Button } from '@/components/ui/button'
// import { auth } from '@/lib/auth'
// import { fetcherWithAuth } from '@/lib/utils'
import { ProblemDetail } from '@/types/type'
import { TbReload } from 'react-icons/tb'

interface ProblemEditorProps {
  data: ProblemDetail
  // langValue: string | undefined
}

export default function Editor({ data }: ProblemEditorProps) {
  // const session = await auth()

  return (
    <div className="flex h-[51px] shrink-0 items-center justify-between border-b border-b-slate-600 px-5">
      <div className="cursor-pointer text-lg font-bold">Editor</div>
      <div className="flex items-center gap-3">
        <Button size="icon" className="size-7 rounded-md bg-slate-500">
          <TbReload className="size-4" />
        </Button>
        <Button
          className="bg-primary h-7 rounded-md px-2 font-semibold"
          // onClick={async () => {
          //   const res = await fetcherWithAuth.post('/submission', {
          //     json: {
          //       problemId: session?.user.username, // 문제 ID
          //       // groupId: 1, // 문제가 속한 Group ID (default: 1)
          //       contestId: null, // 대회 ID (없으면 null)
          //       workbookId: null, // 문제집 ID (없으면 null)
          //       code: [
          //         {
          //           id: data.id,
          //           text: '#include <stdio.h>\nint main() { int a, b; scanf("%d%d", &a, &b); printf("%d\\n", a + b);}',
          //           locked: false
          //         }
          //       ],
          //       language: langValue, // 사용하는 언어
          //       result: 'Judging', // 결과 상태
          //       createTime: new Date().toISOString(),
          //       updateTime: new Date().toISOString()
          //     }
          //   })
          // }}
        >
          Submit
        </Button>
        <SelectScrollable languages={data.languages} />
      </div>
    </div>
  )
}
