import HeaderEditor from '@/app/problem/[id]/_components/HeaderEditor'
import { baseUrl } from '@/lib/vars'
import * as React from 'react'
import MainResizablePanel from './_components/MainResizablePanel'

interface ProblemEditorProps {
  params: {
    id: string
  }
}

export default async function layout({
  params
}: {
  params: ProblemEditorProps['params']
}) {
  const { id } = params
  const response = await fetch(baseUrl + '/problem/' + id)
  const data = await response.json()

  // Specific information for editor main page

  return (
    <div className="flex h-dvh w-full flex-col bg-slate-700 text-white">
      <HeaderEditor id={data.id} title={data.title} />
      <main className="flex h-full flex-col overflow-hidden border border-slate-600">
        <MainResizablePanel data={data} />
      </main>
    </div>
  )
}
