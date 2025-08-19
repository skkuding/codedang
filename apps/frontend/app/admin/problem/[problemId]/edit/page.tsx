'use client'

import { ConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import { PreviewEditorLayout } from '@/app/admin/_components/code-editor/PreviewEditorLayout'
import { Button } from '@/components/shadcn/button'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import type { ProblemDetail } from '@/types/type'
import type { UpdateProblemInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Link from 'next/link'
import { useState, use } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { MdTextSnippet } from 'react-icons/md'
import { DescriptionForm } from '../../../_components/DescriptionForm'
import { FormSection } from '../../../_components/FormSection'
import { SwitchField } from '../../../_components/SwitchField'
import { TitleForm } from '../../../_components/TitleForm'
import { InfoForm } from '../../_components/InfoForm'
import { LimitForm } from '../../_components/LimitForm'
import { SolutionField } from '../../_components/SolutionField'
import { TemplateField } from '../../_components/TemplateField'
import { TestcaseField } from '../../_components/TestcaseField'
import { editSchema } from '../../_libs/schemas'
import { EditProblemForm } from './_components/EditProblemForm'

export default function Page(props: {
  params: Promise<{ problemId: string }>
}) {
  const params = use(props.params)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const { problemId } = params

  const methods = useForm<UpdateProblemInput>({
    resolver: valibotResolver(editSchema),
    defaultValues: { template: [], solution: [] }
  })

  const PreviewPortal = () => {
    const problem = {
      id: 0,
      title: methods.getValues('title'),
      description: methods.getValues('description'),
      inputDescription: methods.getValues('inputDescription'),
      outputDescription: methods.getValues('outputDescription'),
      problemTestcase: methods
        .getValues('testcases')
        ?.filter(({ isHidden }) => !isHidden)
        ?.map((testcase, index) => ({
          id: index + 1,
          input: testcase.input,
          output: testcase.output
        })),
      languages: methods.getValues('languages'),
      timeLimit: methods.getValues('timeLimit'),
      memoryLimit: methods.getValues('memoryLimit'),
      source: methods.getValues('source'),
      tags: [],
      hint: methods.getValues('hint'),
      template: [JSON.stringify(methods.getValues('template'))],
      solution: methods.getValues('solution'),
      difficulty: methods.getValues('difficulty')
    } as ProblemDetail

    return createPortal(
      <div className="fixed inset-0 z-50 flex bg-white">
        <PreviewEditorLayout
          problem={problem}
          exitPreview={() => setIsPreviewing(false)}
        />
      </div>,
      document.body
    )
  }

  return (
    <ConfirmNavigation>
      <ScrollArea className="shrink-0">
        <main className="flex flex-col gap-6 px-20 py-16">
          <div className="-ml-8 flex items-center gap-4">
            <Link href={`/admin/problem/${problemId}`}>
              <FaAngleLeft className="h-12 hover:text-gray-700/80" />
            </Link>
            <span className="text-4xl font-bold">EDIT PROBLEM</span>
          </div>

          <EditProblemForm problemId={Number(problemId)} methods={methods}>
            <FormSection isFlexColumn title="Title">
              <TitleForm placeholder="Enter a problem name" />
            </FormSection>

            <FormSection isFlexColumn title="Description">
              {methods.getValues('description') && (
                <DescriptionForm name="description" />
              )}
            </FormSection>

            <div className="flex justify-between gap-2">
              <div>
                <FormSection
                  isFlexColumn
                  title="Input Description"
                  isLabeled={false}
                >
                  {methods.getValues('inputDescription') && (
                    <DescriptionForm name="inputDescription" />
                  )}
                </FormSection>
              </div>
              <div>
                <FormSection
                  isFlexColumn
                  title="Output Description"
                  isLabeled={false}
                >
                  {methods.getValues('outputDescription') && (
                    <DescriptionForm name="outputDescription" />
                  )}
                </FormSection>
              </div>
            </div>

            <FormSection isFlexColumn title="Info">
              <InfoForm />
            </FormSection>

            <TemplateField />

            <SolutionField />

            {methods.getValues('testcases') && (
              <TestcaseField blockEdit={false} />
            )}

            <FormSection isFlexColumn title="Limit">
              <LimitForm blockEdit={false} />
            </FormSection>

            <SwitchField
              name="hint"
              title="Hint"
              placeholder="Enter a hint"
              formElement="textarea"
              hasValue={methods.getValues('hint') !== ''}
            />

            <SwitchField
              name="source"
              title="Source"
              placeholder="Enter a source"
              formElement="input"
              hasValue={methods.getValues('source') !== ''}
            />
            <div className="flex flex-col gap-5">
              <Button
                type="button"
                variant={'slate'}
                className="bg-fill hover:bg-fill-neutral flex h-[48px] w-full items-center gap-2 px-0"
                onClick={async () => {
                  const isValid = await methods.trigger()
                  if (isValid) {
                    setIsPreviewing(true)
                  }
                }}
              >
                <MdTextSnippet fontSize={20} className="text-[#8a8a8a]" />
                <div className="text-base text-[#8a8a8a]">Show Preview</div>
              </Button>
              <Button
                type="submit"
                className="flex h-12 w-full items-center gap-2 px-0"
              >
                <IoIosCheckmarkCircle fontSize={20} />
                <div className="mb-[2px] text-lg font-bold">Edit</div>
              </Button>
            </div>
          </EditProblemForm>
          {isPreviewing && <PreviewPortal />}
        </main>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </ConfirmNavigation>
  )
}
