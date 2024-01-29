'use client'

import { Switch } from '@/components/ui/switch'
import type { ProblemDetail } from '@/types/type'
import { sanitize } from 'isomorphic-dompurify'
import { useState } from 'react'
import { FiClipboard } from 'react-icons/fi'
import { LuFileText } from 'react-icons/lu'
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard'
import { toast } from 'sonner'

export default function Description({ data }: { data: ProblemDetail }) {
  const [tag, setTag] = useState(false) // tag button on/off
  const [state, copyToClipboard] = useCopyToClipboard()

  return (
    <div className="flex flex-col gap-4 p-6 text-lg">
      <h1 className="font-bold">{`#${data.id}. ${data.title}`}</h1>
      <div
        className="text-sm text-slate-300"
        dangerouslySetInnerHTML={{ __html: sanitize(data.description) }}
      />
      <div>
        <h2 className="mb-3 ">Input</h2>
        <div
          className="text-sm text-slate-300"
          dangerouslySetInnerHTML={{
            __html: sanitize(data.inputDescription)
          }}
        />
      </div>
      <div>
        <h2 className="mb-3 ">Output</h2>
        <div
          className="text-sm text-slate-300"
          dangerouslySetInnerHTML={{
            __html: sanitize(data.outputDescription)
          }}
        />
      </div>
      <div>
        <div className="flex justify-between">
          <h2 className="mb-2 mt-3 ">Sample Input 1</h2>
          <div className="flex items-center justify-center">
            {/* 임시 sample input */}
            {/* <input value={text} onChange={(e) => setText(e.target.value)} /> */}
            <button
              type="button"
              onClick={() => {
                copyToClipboard('A description of the Sample Input 1.')
                {
                  state.error
                    ? toast.error(state.error.message) // or toast.error('Failed to copy!')
                    : toast.success(`Copied to clipboard!`)
                }
              }}
            >
              <FiClipboard className="cursor-pointer" />
            </button>
          </div>
        </div>
        <div className="h-24 w-full rounded-md bg-slate-800 p-2 text-sm">
          {/* 임시 Sample description -> use inputExamples later*/}
          <p className="text-slate-300">A description of the Sample Input 1.</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between">
          <h2 className="mb-2 mt-3 ">Sample Output 1</h2>
        </div>
        <div className="h-24 w-full rounded-md bg-slate-800 p-2 text-sm">
          {/* 임시 Sample description -> use outputExamples later*/}
          <p className="text-slate-300">
            A description of the Sample Output 1.
          </p>
        </div>
      </div>
      <h2>{`Time Limit: ${data.timeLimit} ms`}</h2>
      <h2>{`Memory Limit: ${data.memoryLimit} MB`}</h2>
      <h2 className="mb-2 ">
        {/* TODO: need writer name at api*/}
        Source: Gildong Hong
      </h2>
      <div className="flex h-24 flex-col gap-2">
        <div className="flex items-center justify-start gap-2">
          <h2>Tags</h2>
          <Switch
            onClick={() => {
              setTag((tag: boolean) => !tag)
            }}
            className="hover:border-primary"
          />
        </div>
        {tag && (
          <div className="flex gap-1">
            {data.tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-center rounded-2xl bg-white px-3 py-1 text-[15px] text-blue-400"
              >
                {tag.name}
              </div>
            ))}
          </div>
        )}
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
