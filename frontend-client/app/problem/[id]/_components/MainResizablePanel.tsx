'use client'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { FiClipboard } from 'react-icons/fi'
import { LuFileText } from 'react-icons/lu'

// 우선 Editor 페이지에서 사용할 데이터들만 받아옴
interface MainResizablePanelProps {
  data: {
    id: number
    title: string
    description: string
    inputDescription: string
    outputDescription: string
    inputExamples: string[]
    outputExamples: string[]
  }
}

export default function MainResizablePanel({ data }: MainResizablePanelProps) {
  const [tag, setTag] = useState(false) // tag button on/off 상태

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={35}>
        <div className="flex flex-col gap-y-4 py-4 pl-6 pr-8">
          <div>
            {/* TODO: get rid of <p>tag at 'Problem' api description part */}
            <h1 className="mb-4 text-lg">Description</h1>
            <p className="text-sm text-slate-300">{data.description}</p>
          </div>
          <div>
            <h1 className="mb-3 text-lg">Input</h1>
            <p className="text-sm text-slate-300">{data.inputDescription}</p>
          </div>
          <div>
            <h1 className="mb-3 text-lg">Output</h1>
            <p className="text-sm text-slate-300">{data.outputDescription}</p>
          </div>
          <div>
            <div className="flex justify-between">
              <h1 className="mb-2 mt-3 text-lg">Sample Input 1</h1>
              <div className="flex items-center justify-center">
                <FiClipboard className="cursor-pointer" />
              </div>
            </div>
            <div className="h-24 w-full bg-slate-800 p-2">
              {/* 임시 Sample description -> use inputExamples later*/}
              <p className="text-slate-300">
                A description of the Sample Input 1.
              </p>
            </div>
          </div>
          <div>
            <div className="flex justify-between">
              <h1 className="mb-2 mt-3 text-lg">Sample Output 1</h1>
            </div>
            <div className="h-24 w-full bg-slate-800 p-2">
              {/* 임시 Sample description -> use outputExamples later*/}
              <p className="text-slate-300">
                A description of the Sample Output 1.
              </p>
            </div>
          </div>
          <div>
            {/* TODO: need writer name at api*/}
            <h1 className="mb-2 text-lg">Writer: Gildong Hong</h1>
          </div>
          <div className="flex h-28 flex-col gap-2">
            <div className="flex items-center justify-start gap-2">
              <div>Tag</div>
              <Switch
                onClick={() => {
                  setTag((tag: boolean) => !tag)
                }}
              />
            </div>
            {tag && <div>tag button on 됐을때 tag들 들어갈 자리</div>}
          </div>
          <div className="flex gap-3">
            {/* 임시 이모티콘 이용 -> 해당 이모티콘 찾는중 */}
            <LuFileText className="size-7" />
            <p className="text-xs">
              Compile Version <br /> Documentation
            </p>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={65}
        className="bg-slate-800"
      ></ResizablePanel>
    </ResizablePanelGroup>
  )
}
