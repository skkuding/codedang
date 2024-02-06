'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import Label from './_components/Lable'

const inputStyle =
  'border-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950'

export default function Page() {
  const [showHint, setShowHint] = useState<boolean>(false)
  const [showSource, setShowSource] = useState<boolean>(false)

  return (
    <main className="flex flex-col gap-6 p-8">
      <div className="flex items-center gap-4">
        <FaAngleLeft className="h-12" />
        <span className="text-4xl font-bold">Create Problem</span>
      </div>

      <form action="" className="flex w-[760px] flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Label>Title</Label>
          <Input
            id="title"
            type="text"
            placeholder="Name your problem"
            className={cn(inputStyle, 'w-[380px]')}
          />
        </div>

        {/* TODO: Info Component로 변경 */}
        <div className="flex flex-col gap-1">
          <Label>Info</Label>
          <div className="flex gap-4">
            <Input
              id="level"
              type="text"
              placeholder="level"
              className={cn(inputStyle, 'w-[115px]')}
            />
            <Input
              id="language"
              type="text"
              placeholder="language"
              className={cn(inputStyle, 'w-[115px]')}
            />
            <Input
              id="tags"
              type="text"
              placeholder="tags"
              className={cn(inputStyle, 'w-[115px]')}
            />
          </div>
        </div>

        {/* TODO: Description Component로 변경 */}
        <div className="flex flex-col gap-1">
          <Label>Description</Label>
          <Textarea
            id="description"
            placeholder="Enter a description..."
            className="h-[200px] resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <div className="flex flex-col gap-1">
              <Label>Input Description</Label>
              <Textarea
                id="inputDescription"
                placeholder="Enter a description..."
                className="h-[120px] w-[360px] resize-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Output Description</Label>
              <Textarea
                id="outputDescription"
                placeholder="Enter a description..."
                className="h-[120px] w-[360px] resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Sample</Label>
          <Textarea
            id="sample"
            placeholder="sample"
            className="h-[120px] resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Testcase</Label>
          <Textarea
            id="testcase"
            placeholder="testcase"
            className="h-[120px] resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
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
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Label required={false}>Hint</Label>
            <Switch
              onCheckedChange={() => setShowHint(!showHint)}
              className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
            />
          </div>
          {showHint && (
            <Textarea
              id="hint"
              placeholder="Enter a hint"
              className="h-[120px] w-[760px] resize-none"
            />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Label required={false}>Source</Label>
            <Switch
              onCheckedChange={() => setShowSource(!showSource)}
              className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
            />
          </div>
          {showSource && (
            <Input
              id="source"
              type="text"
              placeholder="Enter a source"
              className={cn(inputStyle, 'h-[36px] w-[380px]')}
            />
          )}
        </div>

        <Button
          type="submit"
          className="mt-6 flex h-[36px] w-[100px] gap-2 bg-black hover:bg-black/80"
        >
          <IoMdCheckmarkCircleOutline fontSize={18} />
          Create
        </Button>
      </form>
    </main>
  )
}
