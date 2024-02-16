import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Button } from '@/components/ui/button'
import { fetcher } from '@/lib/utils'
import type { Problem } from '@/types/type'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { columns } from './_components/Columns'

// interface DataTableProblem {
//   id: string
//   title: string
//   difficulty: string
//   submissionCount: number
//   acceptedRate: number
//   languages: string[]
//   problemTag: Tag[]
// }

// const GET_PROBLEMS = gql`
//   query GetProblems($groupId: Int!, $cursor: Int, $take: Int!, $input: FilterProblemsInput!) {
//     getProblems(groupId: $groupId, cursor: $cursor, take: $take, input: $input) {
//       id
//       title
//       difficulty
//       submissionCount
//       acceptedRate
//       languages
//       problemTag{
//         tag{
//           id
//           name
//         }
//       }
//     }
//   }
// `
export const dynamic = 'force-dynamic'

export default async function Page() {
  // const [problems, setProblems] = useState<Problem[]>([])
  // useEffect(() => {
  //   fetcherGql(GET_PROBLEMS, {
  //     groupId: 1,
  //     cursor: 1,
  //     take: 10,
  //     input: {
  //       difficulty: ["Level1", "Level2", "Level3", "Level4", "Level5"],
  //       languages: ["C", "Cpp", "Java", "Python3"],
  //     }

  //   }).then((data) => {
  //     const transformedData = data.getProblems.map(
  //       (problem: { id: string; title: string, difficulty: string, submissionCount: number, acceptedRate: number, languages: string[], problemTag: Tag[] }) => ({
  //         ...problem,
  //         id: Number(problem.id),
  //         problemTag: problem.problemTag.map((tag: Tag) => ({
  //           ...tag,
  //           id: Number(tag.id)
  //         }))
  //       })
  //     )
  //     setProblems(transformedData)
  //   })
  // }, [])

  // TODO:  Codedang Admin Get Problems API에 problemTags내용이 추가되면 Admin에서 가져오기 (현재는 problemTag 전부 null로 돼있음)
  const { problems }: { problems: Problem[] } = await fetcher
    .get('problem', {
      searchParams: {
        take: 15
      }
    })
    .json()

  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <div>
          <div className="flex text-4xl font-bold">Problem List</div>
          <p className="text-lg text-slate-500">Here&apos;s a list you made</p>
        </div>
        <Link href="/admin/problem/create">
          <Button className="rounded-md bg-blue-500 px-3 py-[6px] text-white hover:bg-blue-700">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Create
          </Button>
        </Link>
      </div>
      <DataTableAdmin columns={columns} data={problems} />
    </div>
  )
}
