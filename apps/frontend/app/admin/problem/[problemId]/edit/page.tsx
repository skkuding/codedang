'use client'

import { useConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import { Button } from '@/components/shadcn/button'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { UPDATE_PROBLEM } from '@/graphql/problem/mutations'
import { GET_PROBLEM } from '@/graphql/problem/queries'
import { useMutation, useQuery } from '@apollo/client'
import type { Template, Testcase, UpdateProblemInput } from '@generated/graphql'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { toast } from 'sonner'
import DescriptionForm from '../../../_components/DescriptionForm'
import FormSection from '../../../_components/FormSection'
import SwitchField from '../../../_components/SwitchField'
import TitleForm from '../../../_components/TitleForm'
import VisibleForm from '../../../_components/VisibleForm'
import { CautionDialog } from '../../_components/CautionDialog'
import InfoForm from '../../_components/InfoForm'
import LimitForm from '../../_components/LimitForm'
import PopoverVisibleInfo from '../../_components/PopoverVisibleInfo'
import TemplateField from '../../_components/TemplateField'
import TestcaseField from '../../_components/TestcaseField'
import { editSchema } from '../../_libs/schemas'
import { validateScoreWeight } from '../../_libs/utils'
import { ScoreCautionDialog } from './_components/ScoreCautionDialog'

export default function Page({ params }: { params: { problemId: string } }) {
  const { problemId } = params
  const shouldSkipWarning = useRef(false)
  const router = useRouter()

  useConfirmNavigation(shouldSkipWarning)

  const methods = useForm<UpdateProblemInput>({
    resolver: zodResolver(editSchema),
    defaultValues: { template: [] }
  })

  const { handleSubmit, setValue, getValues } = methods

  const [showHint, setShowHint] = useState<boolean>(false)
  const [showSource, setShowSource] = useState<boolean>(false)
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false)
  const [dialogDescription, setDialogDescription] = useState<string>('')
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState<boolean>(false)
  const initialValues = useRef<{
    testcases: Testcase[]
    timeLimit: number
    memoryLimit: number
  } | null>(null)

  const pendingInput = useRef<UpdateProblemInput | null>(null)

  useQuery(GET_PROBLEM, {
    variables: {
      groupId: 1,
      id: Number(problemId)
    },
    onCompleted: (problemData) => {
      const data = problemData.getProblem

      const initialFormValues = {
        testcases: data.testcase,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit
      }
      initialValues.current = initialFormValues

      setValue('id', Number(problemId))
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
      setValue(
        'inputDescription',
        data.inputDescription || '<p>Change this</p>'
      )
      setValue(
        'outputDescription',
        data.outputDescription || '<p>Change this</p>'
      )
      setValue('testcases', data.testcase)
      setValue('timeLimit', data.timeLimit)
      setValue('memoryLimit', data.memoryLimit)
      setValue('hint', data.hint)
      if (data.hint !== '') setShowHint(true)
      setValue('source', data.source)
      if (data.source !== '') setShowSource(true)
      if (data.template) {
        const templates = JSON.parse(data.template[0])
        templates.map((template: Template, index: number) => {
          setValue(`template.${index}`, {
            language: template.language,
            code: [
              {
                id: template.code[0].id,
                text: template.code[0].text,
                locked: template.code[0].locked
              }
            ]
          })
        })
      }
    }
  })

  const [updateProblem, { error }] = useMutation(UPDATE_PROBLEM)

  const handleUpdate = async () => {
    if (pendingInput.current) {
      await updateProblem({
        variables: {
          groupId: 1,
          input: pendingInput.current
        }
      })
      if (error) {
        toast.error('Failed to update problem')
        return
      }
      shouldSkipWarning.current = true
      toast.success('Successfully updated problem')
      router.push('/admin/problem')
      router.refresh()
    }
  }

  const onSubmit = async (input: UpdateProblemInput) => {
    const testcases = getValues('testcases') as Testcase[]
    if (validateScoreWeight(testcases) === false) {
      setDialogDescription(
        'The scoring ratios have not been specified correctly.\nPlease review and correct them.'
      )
      setDialogOpen(true)
      return
    }

    pendingInput.current = input
    if (initialValues.current) {
      const currentValues = getValues()
      let scoreCalculationChanged = false

      if (
        JSON.stringify(currentValues.testcases) !==
        JSON.stringify(initialValues.current.testcases)
      ) {
        scoreCalculationChanged = true
      } else if (currentValues.timeLimit !== initialValues.current.timeLimit) {
        scoreCalculationChanged = true
      } else if (
        currentValues.memoryLimit !== initialValues.current.memoryLimit
      ) {
        scoreCalculationChanged = true
      }

      if (scoreCalculationChanged) {
        setIsScoreDialogOpen(true)
        return
      }
    }
    await handleUpdate()
  }

  return (
    <ScrollArea className="shrink-0">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="-ml-8 flex items-center gap-4">
          <Link href={`/admin/problem/${problemId}`}>
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <span className="text-4xl font-bold">Edit Problem</span>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-[760px] flex-col gap-6"
        >
          <FormProvider {...methods}>
            <div className="flex gap-32">
              <FormSection title="Title">
                <TitleForm placeholder="Enter a problem name" />
              </FormSection>

              <FormSection title="Visible">
                <PopoverVisibleInfo />
                <VisibleForm blockEdit={getValues('isVisible') === null} />
              </FormSection>
            </div>

            <FormSection title="Info">
              <InfoForm />
            </FormSection>

            <FormSection title="Description">
              {getValues('description') && (
                <DescriptionForm name="description" />
              )}
            </FormSection>

            <div className="flex justify-between">
              <div className="w-[360px]">
                <FormSection title="Input Description">
                  {getValues('inputDescription') && (
                    <DescriptionForm name="inputDescription" />
                  )}
                </FormSection>
              </div>
              <div className="w-[360px]">
                <FormSection title="Output Description">
                  {getValues('outputDescription') && (
                    <DescriptionForm name="outputDescription" />
                  )}
                </FormSection>
              </div>
            </div>

            {getValues('testcases') && <TestcaseField blockEdit={false} />}

            <FormSection title="Limit">
              <LimitForm blockEdit={false} />
            </FormSection>
            <TemplateField />
            <SwitchField
              name="hint"
              title="Hint"
              placeholder="Enter a hint"
              formElement="textarea"
              hasValue={showHint}
            />
            <SwitchField
              name="source"
              title="Source"
              placeholder="Enter a source"
              formElement="input"
              hasValue={showSource}
            />

            <Button
              type="submit"
              className="flex h-[36px] w-[90px] items-center gap-2 px-0"
            >
              <IoIosCheckmarkCircle fontSize={20} />
              <div className="text-base">Edit</div>
            </Button>
          </FormProvider>
        </form>
      </main>
      <ScrollBar orientation="horizontal" />
      <CautionDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        description={dialogDescription}
      />
      <ScoreCautionDialog
        isOpen={isScoreDialogOpen}
        onCancel={() => setIsScoreDialogOpen(false)}
        onConfirm={async () => {
          await handleUpdate()
          setIsScoreDialogOpen(false)
        }}
        problemId={Number(problemId)}
      />
    </ScrollArea>
  )
}
