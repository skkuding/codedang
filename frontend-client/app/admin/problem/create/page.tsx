'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useState, useRef } from 'react'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { toast } from 'sonner'
import ExampleTextarea from './_components/ExampleTextarea'
import Label from './_components/Lable'

const inputStyle =
  'border-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950'

interface Example {
  id: number
  input: string
  output: string
  type: 'sample' | 'testcase'
}

// savepoint
export default function Page() {
  const [showHint, setShowHint] = useState<boolean>(false)
  const [showSource, setShowSource] = useState<boolean>(false)

  const [samples, setSamples] = useState<Example[]>([
    { id: 1, input: '', output: '', type: 'sample' }
  ])
  const [testcases, setTestcases] = useState<Example[]>([
    { id: 1, input: '', output: '', type: 'testcase' }
  ])
  const sampleCounter = useRef(1)
  const testcaseCounter = useRef(1)

  const addExample = (type: 'sample' | 'testcase') => {
    const newId =
      type === 'sample' ? ++sampleCounter.current : ++testcaseCounter.current
    if (type === 'sample') {
      setSamples((prevSamples) => [
        ...prevSamples,
        { id: newId, input: '', output: '', type }
      ])
    } else if (type === 'testcase') {
      setTestcases((prevTestcases) => [
        ...prevTestcases,
        { id: newId, input: '', output: '', type }
      ])
    }
  }

  const removeExample = (type: 'sample' | 'testcase', id: number) => {
    const examples = type === 'sample' ? samples : testcases
    if (examples.length <= 1) {
      toast.warning(`At least one ${type} is required`)
      return
    }

    if (type === 'sample') {
      setSamples((prevSamples) =>
        prevSamples.filter((sample) => sample.id !== id)
      )
    } else if (type === 'testcase') {
      setTestcases((prevTestcases) =>
        prevTestcases.filter((testcase) => testcase.id !== id)
      )
    }
  }

  const updateExample = (
    type: 'sample' | 'testcase',
    id: number,
    input: string,
    output: string
  ) => {
    if (type === 'sample') {
      setSamples((prevSamples) =>
        prevSamples.map((sample) =>
          sample.id === id ? { ...sample, input, output } : sample
        )
      )
    } else if (type === 'testcase') {
      setTestcases((prevTestcases) =>
        prevTestcases.map((testcase) =>
          testcase.id === id ? { ...testcase, input, output } : testcase
        )
      )
    }
  }

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
          <div className="flex items-center gap-2">
            <Label>Sample</Label>
            <Badge
              onClick={() => addExample('sample')}
              className="h-[18px] w-[45px] cursor-pointer items-center justify-center bg-gray-100 p-0 text-xs font-medium text-gray-500 hover:bg-gray-200"
            >
              + add
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            {samples.map(({ id, input, output }) => (
              <ExampleTextarea
                key={id}
                id={id}
                onRemove={() => removeExample('sample', id)}
                onInputChange={(newInput: string) =>
                  updateExample('sample', id, newInput, output)
                }
                onOutputChange={(newOutput: string) =>
                  updateExample('sample', id, input, newOutput)
                }
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Label>Testcase</Label>
            <Badge
              onClick={() => addExample('testcase')}
              className="h-[18px] w-[45px] cursor-pointer items-center justify-center bg-gray-100 p-0 text-xs font-medium text-gray-500 hover:bg-gray-200"
            >
              + add
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            {testcases.map(({ id, input, output }) => (
              <ExampleTextarea
                key={id}
                id={id}
                onRemove={() => removeExample('testcase', id)}
                onInputChange={(newInput: string) =>
                  updateExample('testcase', id, newInput, output)
                }
                onOutputChange={(newOutput: string) =>
                  updateExample('testcase', id, input, newOutput)
                }
              />
            ))}
          </div>
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
          onClick={(e) => {
            e.preventDefault()
            console.log(samples)
            console.log(testcases)
          }}
        >
          <IoMdCheckmarkCircleOutline fontSize={18} />
          Create
        </Button>
      </form>
    </main>
  )
}
