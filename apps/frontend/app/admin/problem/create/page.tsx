'use client'

import { gql } from '@generated'
import CheckboxSelect from '@/components/CheckboxSelect'
import OptionSelect from '@/components/OptionSelect'
import TagsSelect from '@/components/TagsSelect'
import TextEditor from '@/components/TextEditor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { languages, levels } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { Level, type CreateProblemInput } from '@generated/graphql'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { MdHelpOutline } from 'react-icons/md'
import { PiWarningBold } from 'react-icons/pi'
import { toast } from 'sonner'
import { z } from 'zod'
import ExampleTextarea from '../_components/ExampleTextarea'
import Label from '../_components/Label'
import { GET_TAGS, inputStyle } from '../utils'

const CREATE_PROBLEM = gql(`
  mutation CreateProblem($groupId: Int!, $input: CreateProblemInput!) {
    createProblem(groupId: $groupId, input: $input) {
      id
      createdById
      groupId
      title
      isVisible
      difficulty
      languages
      problemTag {
        tagId
      }
      description
      inputDescription
      outputDescription
      samples {
        input
        output
      }
      problemTestcase {
        input
        output
      }
      timeLimit
      memoryLimit
      hint
      source
      template
    }
  }
`)

const schema = z.object({
  title: z.string().min(1).max(25),
  isVisible: z.boolean(),
  difficulty: z.enum(levels),
  languages: z.array(z.enum(languages)),
  tagIds: z.array(z.number()),
  description: z.string().min(1),
  inputDescription: z.string().min(1),
  outputDescription: z.string().min(1),
  samples: z
    .array(
      z.object({
        input: z.string().min(1),
        output: z.string().min(1)
      })
    )
    .min(1),
  testcases: z
    .array(
      z.object({
        input: z.string().min(1),
        output: z.string().min(1)
      })
    )
    .min(1),
  timeLimit: z.number().min(0),
  memoryLimit: z.number().min(0),
  hint: z.string().optional(),
  source: z.string().optional(),
  template: z
    .array(
      z
        .object({
          language: z.enum([
            'C',
            'Cpp',
            'Golang',
            'Java',
            'Python2',
            'Python3'
          ]),
          code: z.array(
            z.object({
              id: z.number(),
              text: z.string(),
              locked: z.boolean()
            })
          )
        })
        .optional()
    )
    .optional()
})

export default function Page() {
  const { data: tagsData } = useQuery(GET_TAGS)
  const tags =
    tagsData?.getTags.map(({ id, name }) => ({ id: Number(id), name })) ?? []
  const [showHint, setShowHint] = useState(false)
  const [showSource, setShowSource] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const router = useRouter()

  const {
    handleSubmit,
    control,
    register,
    getValues,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateProblemInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      difficulty: Level.Level1,
      tagIds: [],
      samples: [{ input: '', output: '' }],
      testcases: [{ input: '', output: '' }],
      hint: '',
      source: '',
      template: [],
      isVisible: true
    }
  })

  const watchedSamples = watch('samples')
  const watchedTestcases = watch('testcases')

  const [createProblem, { error }] = useMutation(CREATE_PROBLEM)
  const onSubmit = async (input: CreateProblemInput) => {
    setIsCreating(true)
    await createProblem({
      variables: {
        groupId: 1,
        input
      }
    })
    if (error) {
      toast.error('Failed to create problem')
      setIsCreating(false)
      return
    }
    toast.success('Problem created successfully')
    router.push('/admin/problem')
    router.refresh()
  }

  const addExample = (type: 'samples' | 'testcases') => {
    setValue(type, [...getValues(type), { input: '', output: '' }])
  }

  const removeExample = (type: 'samples' | 'testcases', index: number) => {
    const currentValues = getValues(type)
    if (currentValues.length === 1) {
      toast.warning(
        `At least one ${type === 'samples' ? 'sample' : 'testcase'} is required`
      )
      return
    }
    const updatedValues = currentValues.filter((_, i) => i !== index)
    setValue(type, updatedValues)
  }

  return (
    <ScrollArea className="shrink-0">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="flex items-center gap-4">
          <Link href="/admin/problem">
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <span className="text-4xl font-bold">Create Problem</span>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-[760px] flex-col gap-6"
        >
          <div className="flex gap-6">
            <div className="flex flex-col gap-1">
              <Label>Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Name your problem"
                className={cn(inputStyle, 'w-[380px]')}
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
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Label>Visible</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button>
                      <MdHelpOutline className="text-gray-400 hover:text-gray-700" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="mb-2 px-4 py-3">
                    <ul className="text-sm font-normal leading-none">
                      <li>For contest, &apos;hidden&apos; is recommended.</li>
                      <li>You can edit these settings later.</li>
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="isVisible"
                  render={({ field: { onChange, value } }) => (
                    <div className="flex gap-6">
                      <label className="flex gap-2">
                        <input
                          type="radio"
                          onChange={() => onChange(true)}
                          checked={value}
                          className="accent-black"
                        />
                        <FaEye
                          className={
                            value === true ? 'text-black' : 'text-gray-400'
                          }
                        />
                      </label>
                      <label className="flex gap-2">
                        <input
                          type="radio"
                          onChange={() => onChange(false)}
                          checked={value === false}
                          className="accent-black"
                        />
                        <FaEyeSlash
                          className={
                            value === false ? 'text-black' : 'text-gray-400'
                          }
                        />
                      </label>
                    </div>
                  )}
                />
              </div>
              {errors.isVisible && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <PiWarningBold />
                  required
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Info</Label>
            <div className="flex gap-4">
              <div className="flex flex-col gap-1">
                <Controller
                  render={({ field }) => (
                    <OptionSelect
                      options={levels}
                      value={field.value}
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
                      options={languages}
                      onChange={(selectedLanguages) => {
                        field.onChange(selectedLanguages)
                      }}
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
                    <TagsSelect options={tags} onChange={field.onChange} />
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
              <div className="flex w-[360px] flex-col gap-1">
                <Label>Input Description</Label>
                <Controller
                  render={({ field }) => (
                    <TextEditor
                      placeholder="Enter a description..."
                      onChange={field.onChange}
                    />
                  )}
                  name="inputDescription"
                  control={control}
                />
                {errors.inputDescription && (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <PiWarningBold />
                    required
                  </div>
                )}
              </div>
              <div className="flex w-[360px] flex-col gap-1">
                <Label>Output Description</Label>
                <Controller
                  render={({ field }) => (
                    <TextEditor
                      placeholder="Enter a description..."
                      onChange={field.onChange}
                    />
                  )}
                  name="outputDescription"
                  control={control}
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
                onClick={() => addExample('samples')}
                className="h-[18px] w-[45px] cursor-pointer items-center justify-center bg-gray-200/60 p-0 text-xs font-medium text-gray-500 shadow-sm hover:bg-gray-200"
              >
                + add
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              {watchedSamples &&
                watchedSamples.map((_sample, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <ExampleTextarea
                      onRemove={() => removeExample('samples', index)}
                      inputName={`samples.${index}.input`}
                      outputName={`samples.${index}.output`}
                      register={register}
                    />
                    {errors.samples?.[index] && (
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
            <div className="flex items-center gap-2">
              <Label>Testcase</Label>
              <Badge
                onClick={() => addExample('testcases')}
                className="h-[18px] w-[45px] cursor-pointer items-center justify-center bg-gray-200/60 p-0 text-xs font-medium text-gray-500 shadow-sm hover:bg-gray-200"
              >
                + add
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              {watchedTestcases &&
                watchedTestcases.map((_testcase, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <ExampleTextarea
                      key={index}
                      onRemove={() => removeExample('testcases', index)}
                      inputName={`testcases.${index}.input`}
                      outputName={`testcases.${index}.output`}
                      register={register}
                    />
                    {errors.testcases?.[index] && (
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
                    min={0}
                    placeholder="Time"
                    className={cn(inputStyle, 'h-[36px] w-[112px]')}
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
                    min={0}
                    placeholder="Memory"
                    className={cn(inputStyle, 'h-[36px] w-[112px]')}
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
                  setValue('hint', '')
                }}
                checked={showHint}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
              />
            </div>
            {showHint && (
              <Textarea
                id="hint"
                placeholder="Enter a hint"
                className="min-h-[120px] w-[760px] bg-white"
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
                  setValue('source', '')
                }}
                checked={showSource}
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
            className="flex h-[36px] w-[100px] items-center gap-2 px-0 "
            disabled={isCreating}
          >
            <IoMdCheckmarkCircleOutline fontSize={20} />
            <div className="mb-[2px] text-base">Create</div>
          </Button>
        </form>
      </main>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
