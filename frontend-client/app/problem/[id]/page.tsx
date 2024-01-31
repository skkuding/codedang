import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { fetcher } from '@/lib/utils'
import type { ProblemDetail } from '@/types/type'
import { sanitize } from 'isomorphic-dompurify'
import { LucideFileText, Tag } from 'lucide-react'

export default async function DescriptionPage({
  params
}: {
  params: { id: number }
}) {
  const { id } = params
  const data: ProblemDetail = await fetcher(`problem/${id}`).json()

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-6 text-lg">
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
      <div className="flex items-center gap-3 text-base">
        <h2>Time Limit:</h2>
        <p className="text-slate-300">{data.timeLimit} ms</p>
        <h2>Memory Limit:</h2>
        <p className="text-slate-300">{data.memoryLimit} ms</p>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-b-slate-500">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-base">
              <Tag size={16} />
              Tags
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {data.tags.map((tag) => (
              <Badge key={tag.id} className="bg-slate-300 text-slate-800">
                {tag.name}
              </Badge>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="mt-8 flex gap-3">
        {/* 임시 이모티콘 이용 -> 해당 이모티콘 찾는중 */}
        <LucideFileText className="size-7" />
        <p className="text-xs">
          Compile Version <br /> Documentation
        </p>
      </div>
    </div>
  )
}
