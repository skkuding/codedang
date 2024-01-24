'use client'

import { Switch } from '@/components/ui/switch'
import type { ProblemDetail } from '@/types/type'
import { sanitize } from 'isomorphic-dompurify'
import { useState } from 'react'
// FIXME: react-use library 사용하기
import CopyToClipboard from 'react-copy-to-clipboard'
// FIXME: react-icons library 사용하지 않기
import { FiClipboard } from 'react-icons/fi'
import { LuFileText } from 'react-icons/lu'

export default function Description({ data }: { data: ProblemDetail }) {
  const [tag, setTag] = useState(false) // tag button on/off

  return (
    <div className="flex flex-col gap-4 p-6 text-lg">
      <div className=" font-bold">{`#${data.id}. ${data.title}`}</div>
      <div
        className="text-sm text-slate-300"
        dangerouslySetInnerHTML={{ __html: sanitize(data.description) }}
      />
      <div>
        <div className="mb-3 ">Input</div>
        <div
          className="text-sm text-slate-300"
          dangerouslySetInnerHTML={{
            __html: sanitize(data.inputDescription)
          }}
        />
      </div>
      <div>
        <div className="mb-3 ">Output</div>
        <div
          className="text-sm text-slate-300"
          dangerouslySetInnerHTML={{
            __html: sanitize(data.outputDescription)
          }}
        />
      </div>
      <div>
        <div className="flex justify-between">
          <div className="mb-2 mt-3 ">Sample Input 1</div>
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
        <div className="h-24 w-full bg-slate-800 p-2 text-sm">
          {/* 임시 Sample description -> use inputExamples later*/}
          <p className="text-slate-300">A description of the Sample Input 1.</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between">
          <div className="mb-2 mt-3 ">Sample Output 1</div>
        </div>
        <div className="h-24 w-full bg-slate-800 p-2 text-sm">
          {/* 임시 Sample description -> use outputExamples later*/}
          <p className="text-slate-300">
            A description of the Sample Output 1.
          </p>
        </div>
      </div>
      <div>{`Time Limit: ${data.timeLimit} ms`}</div>
      <div>{`Memory Limit: ${data.memoryLimit} MB`}</div>
      <div className="mb-2 ">
        {/* TODO: need writer name at api*/}
        Source: Gildong Hong
      </div>
      <div className="flex h-24 flex-col gap-2">
        <div className="flex items-center justify-start gap-2">
          <div>Tags</div>
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
