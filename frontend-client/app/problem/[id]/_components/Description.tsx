'use client'

import { Switch } from '@/components/ui/switch'
import { sanitize } from 'isomorphic-dompurify'
import { useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { FiClipboard } from 'react-icons/fi'
import { LuFileText } from 'react-icons/lu'

interface DescriptionProps {
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

export default function Description({ data }: { data: DescriptionProps }) {
  const [tag, setTag] = useState(false) // tag button on/off

  return (
    <div className="flex flex-col gap-y-4 p-6">
      <div className="text-lg font-bold">{`#${data.id}. ${data.title}`}</div>
      <div
        className="text-sm text-slate-300"
        dangerouslySetInnerHTML={{ __html: sanitize(data.description) }}
      />
      <div>
        <div className="mb-3 text-lg">Input</div>
        <div
          className="text-sm text-slate-300"
          dangerouslySetInnerHTML={{
            __html: sanitize(data.inputDescription)
          }}
        />
      </div>
      <div>
        <div className="mb-3 text-lg">Output</div>
        <div
          className="text-sm text-slate-300"
          dangerouslySetInnerHTML={{
            __html: sanitize(data.outputDescription)
          }}
        />
      </div>
      <div>
        <div className="flex justify-between">
          <div className="mb-2 mt-3 text-lg">Sample Input 1</div>
          <div className="flex items-center justify-center">
            {/* 임시 sample input */}
            <CopyToClipboard
              text="sample input"
              onCopy={() => console.log('복사됨')}
            >
              <FiClipboard className="cursor-pointer" />
            </CopyToClipboard>
          </div>
        </div>
        <div className="h-24 w-full bg-slate-800 p-2">
          {/* 임시 Sample description -> use inputExamples later*/}
          <p className="text-slate-300">A description of the Sample Input 1.</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between">
          <div className="mb-2 mt-3 text-lg">Sample Output 1</div>
        </div>
        <div className="h-24 w-full bg-slate-800 p-2">
          {/* 임시 Sample description -> use outputExamples later*/}
          <p className="text-slate-300">
            A description of the Sample Output 1.
          </p>
        </div>
      </div>
      <div className="text-lg">{`Time Limit: ${data.timeLimit} ms`}</div>
      <div className="text-lg">{`Memory Limit: ${data.memoryLimit} MB`}</div>
      <div className="mb-2 text-lg">
        {/* TODO: need writer name at api*/}
        Writer: Gildong Hong
      </div>
      <div className="flex h-24 flex-col gap-2">
        <div className="flex items-center justify-start gap-2">
          <div className="text-lg">Tags</div>
          <Switch
            onClick={() => {
              setTag((tag: boolean) => !tag)
            }}
            className="hover:border-primary"
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
  )
}
