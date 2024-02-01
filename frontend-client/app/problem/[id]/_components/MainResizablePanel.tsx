'use client'

import Codeeditor from '@/components/Codeeditor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStorage } from '@/lib/hooks'
import useEditorStore from '@/stores/editor'
import type { ProblemDetail } from '@/types/type'
import { Suspense } from 'react'
import Loading from '../loading'
import EditorHeader from './EditorHeader'
import Tab from './Tab'

// 우선 Editor 페이지에서 사용할 데이터들만 받아옴
interface ProblemEditorProps {
  data: ProblemDetail
  children: React.ReactNode
}

export default function MainResizablePanel({
  data,
  children
}: {
  data: ProblemEditorProps['data']
  children: React.ReactNode
}) {
  // get programming language from localStorage
  const [langValue, setValue] = useStorage(
    'programming_lang',
    data.languages[0]
  )

  // if langValue in storage is not in languages, set langValue to the first language
  if (langValue && !data.languages.includes(langValue))
    setValue(data.languages[0])

  const { code, setCode } = useEditorStore()

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="border border-slate-700"
    >
      <ResizablePanel
        defaultSize={35}
        style={{ minWidth: '400px' }}
        minSize={20}
      >
        <div className="grid-rows-editor grid h-full grid-cols-1">
          <Tab id={data.id} />
          <ScrollArea className="[&>div>div]:!block">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </ScrollArea>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle className="border border-slate-700" />

      <ResizablePanel defaultSize={65} className="bg-slate-900">
        <div className="grid-rows-editor grid h-full">
          <EditorHeader data={data} />
          <Codeeditor
            value={code}
            language={langValue as string}
            onChange={setCode}
            height="100%"
            className="h-full"
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
