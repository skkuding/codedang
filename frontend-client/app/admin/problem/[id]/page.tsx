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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { fetcherGql, cn } from '@/lib/utils'
import type {
  Level,
  Language,
  Testcase,
  Sample,
  Template,
  Tag
} from '@/types/type'
import { gql } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { FaAngleLeft } from 'react-icons/fa6'
import { HiLockClosed, HiLockOpen } from 'react-icons/hi'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { MdHelpOutline } from 'react-icons/md'
import { PiWarningBold } from 'react-icons/pi'
import { toast } from 'sonner'
import { z } from 'zod'
import ExampleTextarea from '../_components/ExampleTextarea'
import Label from '../_components/Lable'
import type { TemplateLanguage } from '../utils'
import { GET_TAGS, inputStyle, languageOptions, levels } from '../utils'

interface UpdateProblemInput {
  id: number
  title: string
  isVisible: boolean
  difficulty: Level
  languages: Language[]
  tags: {
    create: number[]
    delete: number[]
  }
  description: string
  inputDescription: string
  outputDescription: string
  samples: Sample[]
  testcases: Testcase[]
  timeLimit: number
  memoryLimit: number
  hint?: string
  source?: string
  template?: Template[]
}

interface GetProblem {
  title: string
  isVisible: boolean
  difficulty: Level
  languages: Language[]
  problemTag: { tag: Tag }[]
  description: string
  inputDescription: string
  outputDescription: string
  problemTestcase: Testcase[]
  // problemSample: Sample[]
  timeLimit: number
  memoryLimit: number
  hint: string
  source: string
  template: string[]
}

const GET_PROBLEM = gql`
  query GetProblem($groupId: Int!, $id: Int!) {
    getProblem(groupId: $groupId, id: $id) {
      title
      isVisible
      difficulty
      languages
      problemTag {
        tag {
          id
          name
        }
      }
      description
      inputDescription
      outputDescription
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
`

const UPDATE_PROBLEM = gql`
  mutation UpdateProblem($groupId: Int!, $input: UpdateProblemInput!) {
    updateProblem(groupId: $groupId, input: $input) {
      id
      createdById
      groupId
      title
      isVisible
      difficulty
      languages
      tags {
        create
        delete
      }
      description
      inputDescription
      outputDescription
      samples {
        input
        output
        scoreWeight
      }
      testcases {
        input
        output
        scoreWeight
      }
      timeLimit
      memoryLimit
      hint
      source
      template {
        code {
          id
          locked
          text
        }
        language
      }
    }
  }
`

const schema = z.object({
  title: z.string().min(1).max(25),
  isVisible: z.boolean(),
  difficulty: z.enum(['Level1', 'Level2', 'Level3', 'Level4', 'Level5']),
  languages: z.array(
    z.enum(['C', 'Cpp', 'Golang', 'Java', 'Python2', 'Python3'])
  ),
  tags: z.object({ create: z.array(z.number()), delete: z.array(z.number()) }),
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
        output: z.string().min(1),
        scoreWeight: z.number().optional()
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
  const [showHint, setShowHint] = useState<boolean>(true)
  const [showSource, setShowSource] = useState<boolean>(true)
  const [samples, setSamples] = useState<Sample[]>([{ input: '', output: '' }])
  const [testcases, setTestcases] = useState<Testcase[]>([
    { input: '', output: '' }
  ])
  const [tags, setTags] = useState<Tag[]>([])
  const [languages, setLanguages] = useState<TemplateLanguage[]>([])

  const [problemData, setProblemData] = useState<GetProblem>()
  const [fetchedTags, setFetchedTags] = useState<number[]>([])
  const [fetchedLangauges, setFetchedLanguages] = useState<Language[]>([])
  const [fetchedDifficulty, setFetchedDifficulty] = useState<Level>()
  const [fetchedDescription, setFetchedDescription] = useState<string>('')
  const [fetchedTemplateLanguage, setFetchedTemplateLanguage] = useState<
    Language[]
  >([])

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

    fetcherGql(GET_PROBLEM, {
      groupId: 1,
      id: Number(id)
    }).then((data) => {
      setProblemData(data.getProblem)
      setFetchedDifficulty(data.getProblem.difficulty)
      setFetchedLanguages(data.getProblem.languages)
      setFetchedTags(
        data.getProblem.problemTag.map((problemTag: { tag: Tag }) =>
          Number(problemTag.tag.id)
        )
      )
      setFetchedDescription(data.getProblem.description)
      setFetchedTemplateLanguage(
        data.getProblem.template.map((template: string) => {
          const parsedTemplate = JSON.parse(template)[0]
          return parsedTemplate.language
        })
      )
      setLanguages(
        data.getProblem.languages.map((language: Language) => ({
          language,
          isVisible: fetchedTemplateLanguage.includes(language) ? true : false
        }))
      )
    })
  }, [id, problemData])

  useEffect(() => {
    if (problemData) {
      // TODO: add visible and samples
      setValue('title', problemData.title)
      setValue('isVisible', problemData.isVisible)
      setValue('difficulty', problemData.difficulty)
      setValue('languages', problemData.languages)
      setValue(
        'tags.create',
        problemData.problemTag.map((problemTag) => Number(problemTag.tag.id))
      )
      setValue(
        'tags.delete',
        problemData.problemTag.map((problemTag) => Number(problemTag.tag.id))
      )
      setValue('description', problemData.description)
      setValue('inputDescription', problemData.inputDescription)
      setValue('outputDescription', problemData.outputDescription)
      setValue('testcases', problemData.problemTestcase)
      setValue('timeLimit', problemData.timeLimit)
      setValue('memoryLimit', problemData.memoryLimit)
      setValue('hint', problemData.hint)
      setValue('source', problemData.source)
      setValue(
        'template',
        problemData.template.map((template: string) => {
          const parsedTemplate = JSON.parse(template)[0]
          return {
            language: parsedTemplate.language,
            code: [
              {
                id: parsedTemplate.code[0].id,
                text: parsedTemplate.code[0].text,
                locked: parsedTemplate.code[0].locked
              }
            ]
          }
        })
      )
    }
  }, [problemData])

  const {
    handleSubmit,
    control,
    register,
    getValues,
    setValue,
    formState: { errors }
  } = useForm<UpdateProblemInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      samples: [{ input: '', output: '' }],
      template: []
    }
  })

  // TODO: Create Problem 에 sample, visible 추가 시 변경
  const onSubmit = async (data: UpdateProblemInput) => {
    try {
      const res = await fetcherGql(UPDATE_PROBLEM, {
        groupId: 1,
        input: data
      })
      console.log(res)
    } catch (error) {
      console.error(error)
      console.log(data)
    }
  }

  const addExample = (type: 'samples' | 'testcases') => {
    const currentValues = getValues(type)
    setValue(type, [...currentValues, { input: '', output: '' }])
    type === 'samples'
      ? setSamples(() => [...samples, { input: '', output: '' }])
      : setTestcases(() => [...testcases, { input: '', output: '' }])
  }

  const removeExample = (type: 'samples' | 'testcases', index: number) => {
    const currentValues = getValues(type)
    if (currentValues.length === 1) {
      toast.warning(`At least one ${type} is required`)
      return
    }
    const updatedValues = currentValues.filter((_, i) => i !== index)
    setValue(type, updatedValues)
    type === 'samples' ? setSamples(updatedValues) : setTestcases(updatedValues)
  }

  return (
    <ScrollArea className="w-full">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="flex items-center gap-4">
          <Link href="/admin/problem">
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
                      onChange={field.onChange}
                      defaultValue={fetchedDifficulty}
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
                      onChange={(selectedLanguages) => {
                        field.onChange(selectedLanguages)
                        setLanguages(
                          selectedLanguages.map((language) => ({
                            language,
                            isVisible:
                              languages.filter(
                                (prev) => prev.language === language
                              ).length > 0
                                ? languages.filter(
                                    (prev) => prev.language === language
                                  )[0].isVisible
                                : false
                          })) as TemplateLanguage[]
                        )
                      }}
                      defaultValue={fetchedLangauges}
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
                      defaultValue={fetchedTags}
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
            {fetchedDescription && (
              <Controller
                render={({ field }) => (
                  <TextEditor
                    placeholder="Enter a description..."
                    onChange={field.onChange}
                    defaultValue={fetchedDescription}
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
                  className="h-[120px] w-[360px] resize-none bg-white"
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
                  className="h-[120px] w-[360px] resize-none bg-white"
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
                onClick={() => addExample('samples')}
                className="h-[18px] w-[45px] cursor-pointer items-center justify-center bg-gray-200/60 p-0 text-xs font-medium text-gray-500 shadow-sm hover:bg-gray-200"
              >
                + add
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              {getValues('samples') &&
                getValues('samples').map((_sample, index) => (
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
              {getValues('testcases') &&
                getValues('testcases').map((_testcase, index) => (
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
                className="h-[120px] w-[760px] resize-none bg-white"
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

          <div className="flex flex-col gap-6">
            {languages &&
              (languages as TemplateLanguage[]).map(
                (templateLanguage, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Label required={false}>
                          {templateLanguage.language} Template
                        </Label>
                        <Switch
                          onCheckedChange={() => {
                            setLanguages((prev) =>
                              prev.map((prevLanguage) =>
                                prevLanguage.language ===
                                templateLanguage.language
                                  ? {
                                      ...prevLanguage,
                                      isVisible: !prevLanguage.isVisible
                                    }
                                  : prevLanguage
                              )
                            )
                            setValue(`template.${index}`, {
                              language: templateLanguage.language,
                              code: [
                                {
                                  id: index,
                                  text: '',
                                  locked: true
                                }
                              ]
                            })
                          }}
                          checked={templateLanguage.isVisible}
                          className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                      {templateLanguage.isVisible && (
                        <Textarea
                          placeholder={`Enter a ${templateLanguage.language} template...`}
                          className="h-[180px] w-[480px] bg-white"
                          {...register(`template.${index}.code.0.text`)}
                        />
                      )}
                    </div>
                    {templateLanguage.isVisible && (
                      <div className="flex flex-col gap-3">
                        <Label>Locked</Label>
                        <div className="flex items-center gap-2">
                          <Controller
                            control={control}
                            name={`template.${index}.code.0.locked`}
                            render={({
                              field: { onChange, onBlur, value }
                            }) => (
                              <div className="flex gap-4">
                                <label className="flex gap-1">
                                  <input
                                    type="radio"
                                    onBlur={onBlur}
                                    onChange={() => onChange(true)}
                                    checked={value === true}
                                    className="accent-black"
                                  />
                                  <HiLockClosed
                                    className={
                                      value === true
                                        ? 'text-black'
                                        : 'text-gray-400'
                                    }
                                  />
                                </label>
                                <label className="flex gap-1">
                                  <input
                                    type="radio"
                                    onBlur={onBlur}
                                    onChange={() => onChange(false)}
                                    checked={value === false}
                                    className="accent-black"
                                  />
                                  <HiLockOpen
                                    className={
                                      value === false
                                        ? 'text-black'
                                        : 'text-gray-400'
                                    }
                                  />
                                </label>
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
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
    </ScrollArea>
  )
}
