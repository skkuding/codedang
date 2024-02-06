'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import Label from './_components/Lable'

const inputStyle =
  'border-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950'
export default function Page() {
  return (
    <main className="p-8">
      <div className="flex items-center gap-4">
        <FaAngleLeft className="h-12" />
        <span className="text-4xl font-bold">Create Problem</span>
      </div>

      <form action="" className="w-[760px]">
        <Label>Title</Label>
        <Input
          id="title"
          type="text"
          placeholder="Name your problem"
          className={cn(inputStyle, 'w-[380px]')}
        />

        {/* TODO: Info Component로 변경 */}
        <Label>Info</Label>
        <Input
          id="info"
          type="text"
          placeholder="Enter a short info..."
          className={cn(inputStyle, 'w-[380px]')}
        />

        {/* TODO: Description Component로 변경 */}
        <Label>Description</Label>
        <Textarea
          id="description"
          placeholder="Enter a description..."
          className="h-[200px] resize-none"
        />
        <div className="flex justify-between">
          <div>
            <Label>Input Description</Label>
            <Textarea
              id="inputDescription"
              placeholder="Enter a description..."
              className="h-[120px] w-[360px] resize-none"
            />
          </div>
          <div>
            <Label>Output Description</Label>
            <Textarea
              id="outputDescription"
              placeholder="Enter a description..."
              className="h-[120px] w-[360px] resize-none"
            />
          </div>
        </div>

        <Label>Sample</Label>
        <Textarea
          id="sample"
          placeholder="sample"
          className="h-[120px] resize-none"
        />

        <Label>Testcase</Label>
        <Textarea
          id="testcase"
          placeholder="testcase"
          className="h-[120px] resize-none"
        />

        <Label>Limit</Label>
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <Input
              id="time"
              type="text"
              placeholder="Time"
              className={cn(inputStyle, 'h-[36px] w-[112px]')}
            />
            <p className="text-sm font-bold text-gray-600">ms</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="memory"
              type="text"
              placeholder="Memory"
              className={cn(inputStyle, 'h-[36px] w-[112px]')}
            />
            <p className="text-sm font-bold text-gray-600">MB</p>
          </div>
        </div>

        <Label required={false}>Hint</Label>
        <Textarea
          id="hint"
          placeholder="Enter a hint"
          className="h-[120px] w-[760px] resize-none"
        />

        <Label required={false}>Source</Label>
        <Input
          id="source"
          type="text"
          placeholder="Enter a source"
          className={cn(inputStyle, 'h-[36px] w-[380px]')}
        />

        <Button
          type="submit"
          className="mt-10 flex h-[36px] gap-2 bg-black p-3 hover:bg-black/80"
        >
          <IoMdCheckmarkCircleOutline fontSize={18} />
          Create
        </Button>
      </form>
    </main>
  )
}
