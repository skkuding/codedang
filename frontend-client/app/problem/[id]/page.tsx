import HeaderEditor from '@/app/problem/[id]/_components/HeaderEditor'
import SelectScrollable from '@/app/problem/[id]/_components/SelectScrollable'
import { Button } from '@/components/ui/button'
import { baseUrl } from '@/lib/vars'
import * as React from 'react'
import { TbReload } from 'react-icons/tb'
import MainResizablePanel from './_components/MainResizablePanel'

// Interface for the subset of information for editor
interface ProblemInfo {
  id: number
  title: string
  description: string
  inputDescription: string
  outputDescription: string
  inputExamples: string[]
  outputExamples: string[]
}

interface ProblemEditorProps {
  params: {
    id: string
  }
}

export default async function ProblemEditor({ params }: ProblemEditorProps) {
  const { id } = params
  const response = await fetch(baseUrl + '/problem/' + id)
  const data = await response.json()

  // Specific information for editor main page
  const editorData: ProblemInfo = {
    id: data.id,
    title: data.title,
    description: data.description,
    inputDescription: data.inputDescription,
    outputDescription: data.outputDescription,
    inputExamples: data.inputExamples,
    outputExamples: data.outputExamples
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-slate-700 text-white">
      <HeaderEditor title={data.title} />

      <main className="flex h-full flex-col overflow-hidden border border-slate-600">
        <div className="flex h-10 shrink-0 justify-between border-b border-b-slate-600">
          <div className="ml-6 flex items-center justify-center gap-4">
            {/* 임시 */}
            <div className="text-primary cursor-pointer">Editor</div>
            <div className="cursor-pointer">Submissions</div>
          </div>
          <div className="mr-5 flex items-center gap-3">
            <Button size="icon" className="size-7 rounded-[5px] bg-slate-500">
              <TbReload className="size-4" />
            </Button>
            <Button className="bg-primary h-7 rounded-[5px] px-2">
              <span className="font-semibold">Submit</span>
            </Button>
            {<SelectScrollable languages={data.languages} />}
          </div>
        </div>

        <MainResizablePanel data={editorData} />
      </main>
    </div>
  )
}
