'use client'

import CheckboxSelect from '@/components/CheckboxSelect'
import OptionSelect from '@/components/OptionSelect'
import TagsSelect from '@/components/TagsSelect'
import TextEditor from '@/components/TextEditor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { fetcherGql, cn } from '@/lib/utils'
import type { Level, Language } from '@/types/type'
import { gql } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { PiWarningBold } from 'react-icons/pi'
import { toast } from 'sonner'
import { z } from 'zod'
import ExampleTextarea from './_components/ExampleTextarea'
import Label from './_components/Lable'

const inputStyle =
  'border-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950'
const errorBorderStyle = 'border-red-500 focus-visible:ring-red-500'

// dummy data
const levels = ['Level1', 'Level2', 'Level3', 'Level4', 'Level5']
const languageOptions = ['C', 'Cpp', 'Golang', 'Java', 'Python2', 'Python3']

interface Tag {
  id: number
  name: string
}

interface Example {
  input: string
  output: string
}

export interface ProblemData {
  title: string
  difficulty: Level
  languages: Language[]
  tagIds: number[]
  description: string
  inputDescription: string
  outputDescription: string
  sample: Example[]
  testcase: Example[]
  timeLimit: number
  memoryLimit: number
  hint?: string
  source?: string
}

const GET_TAGS = gql`
  query GetTags {
    getTags {
      id
      name
      createTime
      updateTime
    }
  }
`

const schema = z.object({
  title: z.string().min(1).max(25),
  difficulty: z.enum(['Level1', 'Level2', 'Level3', 'Level4', 'Level5']),
  languages: z.array(
    z.enum(['C', 'Cpp', 'Golang', 'Java', 'Python2', 'Python3'])
  ),
  tagIds: z.array(z.number()).min(1),
  description: z.string().min(1),
  inputDescription: z.string().min(1),
  outputDescription: z.string().min(1),
  sample: z
    .array(z.object({ input: z.string().min(1), output: z.string().min(1) }))
    .min(1),
  testcase: z
    .array(z.object({ input: z.string().min(1), output: z.string().min(1) }))
    .min(1),
  timeLimit: z.number().min(1),
  memoryLimit: z.number().min(1),
  hint: z.string().optional(),
  source: z.string().optional()
})

export default function Page() {
  const [showHint, setShowHint] = useState<boolean>(false)
  const [showSource, setShowSource] = useState<boolean>(false)
  const [samples, setSamples] = useState<Example[]>([{ input: '', output: '' }])
  const [testcases, setTestcases] = useState<Example[]>([
    { input: '', output: '' }
  ])
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    fetcherGql(GET_TAGS).then((data) => {
      const transformedData = data.getTags.map(
        (tag: { id: string; name: string }) => ({
          ...tag,
          id: Number(tag.id)
        })
      )
      setTags(transformedData)
    })
  }, [])

  const {
    handleSubmit,
    control,
    register,
    unregister,
    getValues,
    setValue,
    formState: { errors }
  } = useForm<ProblemData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sample: [{ input: '', output: '' }],
      testcase: [{ input: '', output: '' }]
    }
  })

  // TODO: Create Problem API 연결
  const onSubmit = async (data: ProblemData) => {
    console.log(data)
  }

  const addExample = (type: 'sample' | 'testcase') => {
    const currentValues = getValues(type)
    setValue(type, [...currentValues, { input: '', output: '' }])
    type === 'sample'
      ? setSamples(() => [...samples, { input: '', output: '' }])
      : setTestcases(() => [...testcases, { input: '', output: '' }])
  }

  const removeExample = (type: 'sample' | 'testcase', index: number) => {
    const currentValues = getValues(type)
    if (currentValues.length === 1) {
      toast.warning(`At least one ${type} is required`)
      return
    }
    const updatedValues = currentValues.filter((_, i) => i !== index)
    setValue(type, updatedValues)
    type === 'sample' ? setSamples(updatedValues) : setTestcases(updatedValues)
  }

  return (
    <ScrollArea className="w-full">
      <main className="flex flex-col gap-6 p-8">
        <div className="flex items-center gap-4">
          <FaAngleLeft className="h-12" />
          <span className="text-4xl font-bold">Create Problem</span>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-[760px] flex-col gap-6"
        >
          <div className="flex flex-col gap-1">
            <Label>Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Name your problem"
              className={cn(
                inputStyle,
                'w-[380px]',
                errors.title && errorBorderStyle
              )}
              {...register('title')}
            />
            {errors.title && (
              <div className="flex items-center gap-1 text-xs text-red-500">
                <PiWarningBold />
                {getValues('title').length === 0
                  ? 'required'
                  : errors.title.message}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label>Info</Label>
            <div className="flex gap-4">
              <div className="flex flex-col gap-1">
                <Controller
                  render={({ field }) => (
                    <OptionSelect
                      levels={levels}
                      {...field}
                      onChange={field.onChange}
                    />
                  )}
                  name="difficulty"
                  control={control}
                />
                {errors.difficulty && (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <PiWarningBold />
                    required
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Controller
                  render={({ field }) => (
                    <CheckboxSelect
                      title="Language"
                      options={languageOptions}
                      {...field}
                      onChange={field.onChange}
                    />
                  )}
                  name="languages"
                  control={control}
                />
                {errors.languages && (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <PiWarningBold />
                    required
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Controller
                  render={({ field }) => (
                    <TagsSelect
                      options={tags}
                      {...field}
                      onChange={field.onChange}
                    />
                  )}
                  name="tagIds"
                  control={control}
                />
                {errors.tagIds && (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <PiWarningBold />
                    required
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Description</Label>
            <Controller
              render={({ field }) => (
                <TextEditor
                  placeholder="Enter a description..."
                  {...field}
                  onChange={field.onChange}
                />
              )}
              name="description"
              control={control}
            />
            {errors.description && (
              <div className="flex items-center gap-1 text-xs text-red-500">
                <PiWarningBold />
                required
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <div className="flex flex-col gap-1">
                <Label>Input Description</Label>
                <Textarea
                  id="inputDescription"
                  placeholder="Enter a description..."
                  className={cn(
                    'h-[120px] w-[360px] resize-none',
                    errors.inputDescription && errorBorderStyle
                  )}
                  {...register('inputDescription')}
                />
                {errors.inputDescription && (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <PiWarningBold />
                    required
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label>Output Description</Label>
                <Textarea
                  id="outputDescription"
                  placeholder="Enter a description..."
                  className={cn(
                    'h-[120px] w-[360px] resize-none',
                    errors.outputDescription && errorBorderStyle
                  )}
                  {...register('outputDescription')}
                />
                {errors.outputDescription && (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <PiWarningBold />
                    required
                  </div>
                )}
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
              {getValues('sample') &&
                getValues('sample').map((_sample, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <ExampleTextarea
                      onRemove={() => removeExample('sample', index)}
                      inputName={`sample.${index}.input`}
                      outputName={`sample.${index}.output`}
                      className={errors.sample?.[index] && errorBorderStyle}
                      register={register}
                    />
                    {errors.sample?.[index] && (
                      <div className="flex items-center gap-1 text-xs text-red-500">
                        <PiWarningBold />
                        required{errors.sample?.message}
                      </div>
                    )}
                  </div>
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
              {getValues('testcase') &&
                getValues('testcase').map((_testcase, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <ExampleTextarea
                      key={index}
                      onRemove={() => removeExample('testcase', index)}
                      inputName={`testcase.${index}.input`}
                      outputName={`testcase.${index}.output`}
                      className={errors.testcase?.[index] && errorBorderStyle}
                      register={register}
                    />
                    {errors.testcase?.[index] && (
                      <div className="flex items-center gap-1 text-xs text-red-500">
                        <PiWarningBold />
                        required
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Limit</Label>
            <div className="flex gap-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Input
                    id="time"
                    type="number"
                    placeholder="Time"
                    className={cn(
                      inputStyle,
                      'h-[36px] w-[112px]',
                      errors.timeLimit && errorBorderStyle
                    )}
                    {...register('timeLimit', {
                      setValueAs: (value: string) => parseInt(value, 10)
                    })}
                  />
                  <p className="text-sm font-bold text-gray-600">ms</p>
                </div>
                {errors.timeLimit && (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <PiWarningBold />
                    {Number.isNaN(getValues('timeLimit'))
                      ? 'required'
                      : errors.timeLimit?.message}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Input
                    id="memory"
                    type="number"
                    placeholder="Memory"
                    className={cn(
                      inputStyle,
                      'h-[36px] w-[112px]',
                      errors.memoryLimit && errorBorderStyle
                    )}
                    {...register('memoryLimit', {
                      setValueAs: (value: string) => parseInt(value, 10)
                    })}
                  />
                  <p className="text-sm font-bold text-gray-600">MB</p>
                </div>
                {errors.memoryLimit && (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <PiWarningBold />
                    {Number.isNaN(getValues('memoryLimit'))
                      ? 'required'
                      : errors.memoryLimit?.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Label required={false}>Hint</Label>
              <Switch
                onCheckedChange={() => {
                  setShowHint(!showHint)
                  unregister('hint')
                }}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
              />
            </div>
            {showHint && (
              <Textarea
                id="hint"
                placeholder="Enter a hint"
                className="h-[120px] w-[760px] resize-none"
                {...register('hint')}
              />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Label required={false}>Source</Label>
              <Switch
                onCheckedChange={() => {
                  setShowSource(!showSource)
                  unregister('source')
                }}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
              />
            </div>
            {showSource && (
              <Input
                id="source"
                type="text"
                placeholder="Enter a source"
                className={cn(inputStyle, 'h-[36px] w-[380px]')}
                {...register('source')}
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
    </ScrollArea>
  )
}
