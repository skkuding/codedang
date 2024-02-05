'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FaAngleLeft } from 'react-icons/fa6'
import Label from './_components/Lable'

export default function Page() {
  return (
    <div className="p-8">
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
          className="w-[380px]"
        />

        <Label>Info</Label>
        <Input
          id="info"
          type="text"
          placeholder="Enter a short info..."
          className="w-[380px]"
        />

        <Label>Description</Label>
        <Textarea
          id="description"
          type="text"
          placeholder="Enter a description..."
          className="h-[200px] resize-none"
        />
        <div className="flex justify-between">
          <div>
            <Label>Input Description</Label>
            <Textarea
              id="inputDescription"
              type="text"
              placeholder="Enter a description..."
              className="h-[120px] w-[360px] resize-none"
            />
          </div>
          <div>
            <Label>Output Description</Label>
            <Textarea
              id="outputDescription"
              type="text"
              placeholder="Enter a description..."
              className="h-[120px] w-[360px] resize-none"
            />
          </div>
        </div>

        <Label>Sample</Label>
        <Textarea
          id="sample"
          type="text"
          placeholder="sample"
          className="h-[120px] resize-none"
        />

        <Label>Testcase</Label>
        <Textarea
          id="testcase"
          type="text"
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
              className="h-[36px] w-[112px]"
            />
            <p className="text-sm font-bold text-gray-600">ms</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="memory"
              type="text"
              placeholder="Memory"
              className="h-[36px] w-[112px]"
            />
            <p className="text-sm font-bold text-gray-600">MB</p>
          </div>
        </div>

        <Label required={false}>Hint</Label>
        <Textarea
          id="hint"
          type="text"
          placeholder="Enter a hint"
          className="h-[120px] w-[760px] resize-none"
        />

        <Label required={false}>Source</Label>
        <Input
          id="source"
          type="text"
          placeholder="Enter a source"
          className="h-[36px] w-[380px]"
        />
      </form>
    </div>
  )
}
