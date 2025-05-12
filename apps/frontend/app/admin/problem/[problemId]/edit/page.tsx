'use client'

import { ConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import { EditorDescription } from '@/app/admin/_components/code-editor/EditorDescription'
import { PreviewEditorLayout } from '@/app/admin/_components/code-editor/PreviewEditorLayout'
import { Button } from '@/components/shadcn/button'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { useSession } from '@/libs/hooks/useSession'
import type { ProblemDetail, Template } from '@/types/type'
import type { UpdateProblemInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Link from 'next/link'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle, IoIosEye } from 'react-icons/io'
import { DescriptionForm } from '../../../_components/DescriptionForm'
import { FormSection } from '../../../_components/FormSection'
import { SwitchField } from '../../../_components/SwitchField'
import { TitleForm } from '../../../_components/TitleForm'
import { VisibleForm } from '../../../_components/VisibleForm'
import { InfoForm } from '../../_components/InfoForm'
import { LimitForm } from '../../_components/LimitForm'
import { PopoverVisibleInfo } from '../../_components/PopoverVisibleInfo'
import { TemplateField } from '../../_components/TemplateField'
import { TestcaseField } from '../../_components/TestcaseField'
import { UploadTestcase } from '../../_components/UploadTestcase'
import { editSchema } from '../../_libs/schemas'
import { EditProblemForm } from './_components/EditProblemForm'

export default function Page({ params }: { params: { problemId: string } }) {
  const [isPreviewing, setIsPreviewing] = useState(false)
  const { problemId } = params

  const session = useSession()
  const isAdmin = session?.user?.role !== 'User'

  const methods = useForm<UpdateProblemInput>({
    resolver: valibotResolver(editSchema),
    defaultValues: { template: [] }
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
      template: methods
        .getValues('template')
        ?.map((template) =>
          template.code.map((snippet) => snippet.text).join('\n')
        ),
      difficulty: methods.getValues('difficulty')
    } as ProblemDetail

    return createPortal(
      <div className="fixed inset-0 z-50 flex bg-white">
        <PreviewEditorLayout
          problemTitle={problem.title}
          languages={problem.languages}
          template={methods.getValues('template') as Template[]}
          exitPreview={() => setIsPreviewing(false)}
        >
          <EditorDescription problem={problem} />
        </PreviewEditorLayout>
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
            <span className="text-4xl font-bold">Edit Problem</span>
          </div>

          <EditProblemForm problemId={Number(problemId)} methods={methods}>
            <div className="flex gap-32">
              <FormSection isFlexColumn title="Title">
                <TitleForm placeholder="Enter a problem name" />
              </FormSection>

              <FormSection isFlexColumn title="Visible">
                <PopoverVisibleInfo />
                <VisibleForm
                  blockEdit={
                    methods.getValues('isVisible') === null || !isAdmin
                  }
                />
              </FormSection>
            </div>

            <FormSection isFlexColumn title="Info">
              <InfoForm />
            </FormSection>

            <FormSection isFlexColumn title="Description">
              {methods.getValues('description') && (
                <DescriptionForm name="description" />
              )}
            </FormSection>

            <div className="flex justify-between">
              <div className="w-[360px]">
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
              <div className="w-[360px]">
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

            <FormSection isFlexColumn title="Upload Testcase" isLabeled={false}>
              <UploadTestcase problemId={parseInt(problemId)} />
            </FormSection>

            {methods.getValues('testcases') && (
              <TestcaseField
                blockEdit={false}
                problemId={parseInt(problemId)}
              />
            )}

            <FormSection isFlexColumn title="Limit">
              <LimitForm blockEdit={false} />
            </FormSection>

            <TemplateField />

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
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex h-[36px] w-[90px] items-center gap-2 px-0"
              >
                <IoIosCheckmarkCircle fontSize={20} />
                <div className="text-base">Edit</div>
              </Button>
              <Button
                type="button"
                variant="slate"
                className="flex h-[36px] w-[120px] items-center gap-2 bg-slate-200 px-0"
                onClick={() => setIsPreviewing(true)}
              >
                <IoIosEye fontSize={20} />
                <div className="text-base">Preview</div>
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
