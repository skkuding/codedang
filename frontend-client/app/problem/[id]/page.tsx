import HeaderEditor from '@/app/problem/[id]/_components/HeaderEditor'
import { baseUrl } from '@/lib/vars'
import * as React from 'react'
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
  languages: string[]
  timeLimit: number
  memoryLimit: number
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
    outputExamples: data.outputExamples,
    languages: data.languages,
    timeLimit: data.timeLimit,
    memoryLimit: data.memoryLimit
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-slate-700 text-white">
      <HeaderEditor id={data.id} title={data.title} />

      <main className="flex h-full flex-col overflow-hidden border border-slate-600">
        <MainResizablePanel data={editorData} />
      </main>
    </div>
  )
}
