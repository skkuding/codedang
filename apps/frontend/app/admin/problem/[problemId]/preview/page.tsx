'use client'

import { PreviewEditorResizablePanel } from '@/app/admin/_components/code-editor/PreviewEditorResizablePanel'
import { Button } from '@/components/shadcn/button'
import { GET_PROBLEM } from '@/graphql/problem/queries'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import type { ProblemDetail } from '@/types/type'
import { useQuery } from '@apollo/client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use } from 'react'

interface PageProps {
  params: Promise<{
    problemId: string
  }>
}

export default function Page(props: PageProps) {
  const params = use(props.params)
  const { problemId } = params
  const router = useRouter()

  const { data, loading } = useQuery(GET_PROBLEM, {
    variables: { id: Number(problemId) }
  })

  const problem = loading
    ? null
    : ({
        id: 0,
        ...data?.getProblem,
        problemTestcase:
          data?.getProblem?.testcase
            ?.filter(({ isHidden }) => !isHidden)
            ?.map(({ id, ...rest }) => ({
              id: Number(id),
              ...rest
            })) ?? [],
        tags: []
      } as ProblemDetail)

  return (
    <div className="grid-rows-editor fixed left-0 grid h-dvh w-full min-w-[1000px] overflow-x-auto bg-slate-800 text-white">
      {loading || !problem ? (
        <div className="flex h-dvh items-center justify-center text-white">
          loading...
        </div>
      ) : (
        <>
          <header className="flex h-12 items-center justify-between bg-slate-900 px-6">
            <div className="flex items-center justify-center gap-4 text-lg text-[#787E80]">
              <Link href="/">
                <Image src={codedangLogo} alt="코드당" width={33} />
              </Link>
            </div>

            <Button onClick={() => router.back()} className="h-8 rounded-md">
              Back
            </Button>
          </header>
          <PreviewEditorResizablePanel problem={problem} />
        </>
      )}
    </div>
  )
}
