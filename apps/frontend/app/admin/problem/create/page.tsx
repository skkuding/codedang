'use client'

import { PreviewEditorLayout } from '@/app/admin/_components/code-editor/PreviewEditorLayout'
import { createSchema } from '@/app/admin/problem/_libs/schemas'
import { Button } from '@/components/shadcn/button'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { useSession } from '@/libs/hooks/useSession'
import type { ProblemDetail, Template } from '@/types/type'
import { Level, type CreateProblemInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Link from 'next/link'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline, IoMdEye } from 'react-icons/io'
import { ConfirmNavigation } from '../../_components/ConfirmNavigation'
import { DescriptionForm } from '../../_components/DescriptionForm'
import { FormSection } from '../../_components/FormSection'
import { SwitchField } from '../../_components/SwitchField'
import { TitleForm } from '../../_components/TitleForm'
import { EditorDescription } from '../../_components/code-editor/EditorDescription'
import { InfoForm } from '../_components/InfoForm'
import { LimitForm } from '../_components/LimitForm'
import { SolutionField } from '../_components/SolutionField'
import { TemplateField } from '../_components/TemplateField'
import { TestcaseField } from '../_components/TestcaseField'
import { CreateProblemForm } from './_components/CreateProblemForm'

export default function Page() {
  const [isPreviewing, setIsPreviewing] = useState(false)
  const session = useSession()
  const isAdmin = session?.user?.role !== 'User'

  const methods = useForm<CreateProblemInput>({
    resolver: valibotResolver(createSchema),
    defaultValues: {
      difficulty: Level.Level1,
      tagIds: [],
      inputDescription: '',
      outputDescription: '',
      testcases: [
        { input: '', output: '', isHidden: false, scoreWeight: null }
      ],
      timeLimit: 2000,
      memoryLimit: 512,
      hint: '',
      source: '',
      template: [],
      solution: [],
      isVisible: isAdmin
    }
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
            <Link href="/admin/problem">
              <FaAngleLeft className="h-12 hover:text-gray-700/80" />
            </Link>
            <span className="text-4xl font-bold">CREATE PROBLEM</span>
          </div>

          <CreateProblemForm methods={methods}>
            <FormSection isFlexColumn title="Title">
              <TitleForm placeholder="Enter a problem name" />
            </FormSection>

            <FormSection isFlexColumn title="Description">
              <DescriptionForm name="description" />
            </FormSection>

            <div className="flex justify-between">
              <div className="w-[360px]">
                <FormSection
                  isLabeled={false}
                  isFlexColumn
                  title="Input Description"
                >
                  <DescriptionForm name="inputDescription" />
                </FormSection>
              </div>
              <div className="w-[360px]">
                <FormSection
                  isLabeled={false}
                  isFlexColumn
                  title="Output Description"
                >
                  <DescriptionForm name="outputDescription" />
                </FormSection>
              </div>
            </div>

            <TestcaseField />

            <FormSection isFlexColumn title="Limit">
              <LimitForm />
            </FormSection>

            <FormSection isFlexColumn title="Info">
              <InfoForm />
            </FormSection>

            <TemplateField />

            <SolutionField />

            <SwitchField
              name="hint"
              title="Hint"
              formElement="textarea"
              placeholder="Enter a hint"
            />

            <SwitchField
              name="source"
              title="Source"
              placeholder="Enter a source"
              formElement="input"
            />

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex h-[36px] w-[100px] items-center gap-2 px-0"
              >
                <IoMdCheckmarkCircleOutline fontSize={20} />
                <div className="mb-[2px] text-base">Create</div>
              </Button>
              <Button
                type="button"
                variant={'slate'}
                className="flex h-[36px] w-[120px] items-center gap-2 bg-slate-200 px-0"
                onClick={() => setIsPreviewing(true)}
              >
                <IoMdEye fontSize={20} />
                <div className="text-base">Preview</div>
              </Button>
            </div>
          </CreateProblemForm>
          {isPreviewing && <PreviewPortal />}
        </main>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </ConfirmNavigation>
  )
}
