'use client'

import { createSchema } from '@/app/admin/problem/_libs/schemas'
import { Button } from '@/components/shadcn/button'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { useSession } from '@/libs/hooks/useSession'
import type { ProblemDetail } from '@/types/type'
import { Level, type CreateProblemInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Link from 'next/link'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { ConfirmNavigation } from '../../_components/ConfirmNavigation'
import { DescriptionForm } from '../../_components/DescriptionForm'
import { FormSection } from '../../_components/FormSection'
import { SwitchField } from '../../_components/SwitchField'
import { TitleForm } from '../../_components/TitleForm'
import { VisibleForm } from '../../_components/VisibleForm'
import { EditorDescription } from '../../_components/code-editor/EditorDescription'
import { InfoForm } from '../_components/InfoForm'
import { LimitForm } from '../_components/LimitForm'
import { PopoverVisibleInfo } from '../_components/PopoverVisibleInfo'
import { PreviewEditorLayout } from '../_components/PreviewEditorLayout'
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
      testcases: [
        { input: '', output: '', isHidden: false, scoreWeight: null },
        { input: '', output: '', isHidden: true, scoreWeight: null }
      ],
      timeLimit: 2000,
      memoryLimit: 512,
      hint: '',
      source: '',
      template: [],
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
          language={problem.languages[0]}
          code={problem.template[0]}
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
            <span className="text-4xl font-bold">Create Problem</span>
          </div>

          <CreateProblemForm methods={methods}>
            <div className="flex gap-32">
              <FormSection title="Title">
                <TitleForm placeholder="Enter a problem name" />
              </FormSection>

              <FormSection title="Visible">
                <PopoverVisibleInfo />
                <VisibleForm blockEdit={!isAdmin} />
              </FormSection>
            </div>

            <FormSection title="Info">
              <InfoForm />
            </FormSection>

            <FormSection title="Description">
              <DescriptionForm name="description" />
            </FormSection>

            <div className="flex justify-between">
              <div className="w-[360px]">
                <FormSection title="Input Description">
                  <DescriptionForm name="inputDescription" />
                </FormSection>
              </div>
              <div className="w-[360px]">
                <FormSection title="Output Description">
                  <DescriptionForm name="outputDescription" />
                </FormSection>
              </div>
            </div>

            <TestcaseField />

            <FormSection title="Limit">
              <LimitForm />
            </FormSection>

            <TemplateField />

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
                <IoMdCheckmarkCircleOutline fontSize={20} />
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
