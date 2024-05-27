'use client'

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
import { UPDATE_PROBLEM } from '@/graphql/problem/mutations'
import { GET_PROBLEM } from '@/graphql/problem/queries'
import { GET_TAGS } from '@/graphql/problem/queries'
import { languages, levels } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import type { UpdateProblemInput } from '@generated/graphql'
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
import ExampleTextarea from '../../_components/ExampleTextarea'
import Label from '../../_components/Label'
import { inputStyle } from '../../utils'

const schema = z.object({
  id: z.number(),
  title: z.string().min(1).max(200),
  isVisible: z.boolean(),
  difficulty: z.enum(levels),
  languages: z.array(z.enum(languages)),
  tags: z
    .object({ create: z.array(z.number()), delete: z.array(z.number()) })
    .optional(),
  description: z.string().min(1),
  inputDescription: z.string().min(1),
  outputDescription: z.string().min(1),
  samples: z.object({
    create: z.array(
      z
        .object({ input: z.string().min(1), output: z.string().min(1) })
        .optional()
    ),
    delete: z.array(z.number().optional())
  }),
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

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params
  const [showHint, setShowHint] = useState(true)
  const [showSource, setShowSource] = useState(true)

  const { data: tagsData } = useQuery(GET_TAGS)
  const tags =
    tagsData?.getTags.map(({ id, name }) => ({ id: +id, name })) ?? []

  const router = useRouter()

  const {
    handleSubmit,
    control,
    register,
    getValues,
    setValue,
    watch,
    formState: { errors }
  } = useForm<UpdateProblemInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      samples: { create: [], delete: [] },
      template: []
    }
  })

  useQuery(GET_PROBLEM, {
    variables: {
      groupId: 1,
      id: +id
    },
    onCompleted: (problemData) => {
      const data = problemData.getProblem
      setValue('id', +id)
      setValue('title', data.title)
      setValue('isVisible', data.isVisible)
      setValue('difficulty', data.difficulty)
      setValue('languages', data.languages ?? [])
      setValue(
        'tags.create',
        data.tag.map(({ tag }) => Number(tag.id))
      )
      setValue(
        'tags.delete',
        data.tag.map(({ tag }) => Number(tag.id))
      )
      setValue('description', data.description)
      setValue('inputDescription', data.inputDescription)
      setValue('outputDescription', data.outputDescription)
      setValue('samples.create', data?.samples || [])
      setValue('samples.delete', data.samples?.map(({ id }) => +id) || [])
      setValue('testcases', data.testcase)
      setValue('timeLimit', data.timeLimit)
      setValue('memoryLimit', data.memoryLimit)
      setValue('hint', data.hint)
      setValue('source', data.source)
      setValue('template', [])
    }
  })

  const watchedSamples = watch('samples.create')
  const watchedTestcases = watch('testcases')

  const [updateProblem, { error }] = useMutation(UPDATE_PROBLEM)
  const onSubmit = async (input: UpdateProblemInput) => {
    const tagsToDelete = getValues('tags.delete')
    const tagsToCreate = getValues('tags.create')
    input.tags!.create = tagsToCreate.filter(
      (tag) => !tagsToDelete.includes(tag)
    )
    input.tags!.delete = tagsToDelete.filter(
      (tag) => !tagsToCreate.includes(tag)
    )

    await updateProblem({
      variables: {
        groupId: 1,
        input
      }
    })
    if (error) {
      toast.error('Failed to update problem')
      return
    }
    toast.success('Succesfully updated problem')
    router.push('/admin/problem')
    router.refresh()
  }

  const addSample = () => {
    const values = getValues('samples.create')
    const newSample = { input: '', output: '' }
    setValue('samples.create', [...values, newSample])
  }

  const addTestcase = () => {
    const values = getValues('testcases') ?? []
    const newTestcase = { input: '', output: '' }
    setValue('testcases', [...values, newTestcase])
  }

  const removeSample = (index: number) => {
    const currentValues = getValues('samples.create')
    if (currentValues.length <= 1) {
      toast.warning('At least one sample is required')
      return
    }
    const updatedValues = currentValues.filter((_, i) => i !== index)
    setValue('samples.create', updatedValues)
  }

  const removeTestcase = (index: number) => {
    const currentValues = getValues('testcases')
    if ((currentValues?.length ?? 0) <= 1) {
      toast.warning('At least one testcase is required')
      return
    }
    const updatedValues = currentValues?.filter((_, i) => i !== index)
    setValue('testcases', updatedValues)
  }
  return (
    <ScrollArea className="shrink-0">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="flex items-center gap-4">
          <Link href={`/admin/problem/${id}`}>
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <span className="text-4xl font-bold">Edit Problem</span>
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
                  {getValues('title')?.length === 0
                    ? 'required'
                    : errors.title.message?.toString()}
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
                  render={({ field: { onChange, onBlur, value } }) => (
                    <div className="flex gap-6">
                      <label className="flex gap-2">
                        <input
                          type="radio"
                          onBlur={onBlur}
                          onChange={() => onChange(true)}
                          checked={value === true}
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
                          onBlur={onBlur}
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
                      value={field.value as string}
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
                      defaultValue={field.value as string[]}
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
                      onChange={field.onChange}
                      defaultValue={field.value}
                    />
                  )}
                  name="tags.create"
                  control={control}
                />
                {errors.tags && (
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
            {getValues('description') && (
              <Controller
                render={({ field }) => (
                  <TextEditor
                    placeholder="Enter a description..."
                    onChange={field.onChange}
                    defaultValue={field.value as string}
                  />
                )}
                name="description"
                control={control}
              />
            )}
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
                  className="min-h-[120px] w-[360px] bg-white"
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
                  className="min-h-[120px] w-[360px] bg-white"
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
                onClick={addSample}
                className="h-[18px] w-[45px] cursor-pointer items-center justify-center bg-gray-200/60 p-0 text-xs font-medium text-gray-500 shadow-sm hover:bg-gray-200"
              >
                + add
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              {watchedSamples &&
                watchedSamples.map((_, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <ExampleTextarea
                      onRemove={() => {
                        removeSample(index)
                      }}
                      inputName={`samples.create.${index}.input`}
                      outputName={`samples.create.${index}.output`}
                      register={register}
                    />
                    {errors.samples?.create?.[index] && (
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
                onClick={addTestcase}
                className="h-[18px] w-[45px] cursor-pointer items-center justify-center bg-gray-200/60 p-0 text-xs font-medium text-gray-500 shadow-sm hover:bg-gray-200"
              >
                + add
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              {watchedTestcases &&
                watchedTestcases.map((_, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <ExampleTextarea
                      key={index}
                      onRemove={() => removeTestcase(index)}
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
                      : errors.timeLimit?.message?.toString()}
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
                      : errors.memoryLimit?.message?.toString()}
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
          >
            <IoMdCheckmarkCircleOutline fontSize={20} />
            <div className="mb-[2px] text-base">Submit</div>
          </Button>
        </form>
      </main>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
