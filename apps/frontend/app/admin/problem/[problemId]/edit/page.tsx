'use client'

import { ConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import { PreviewEditorLayout } from '@/app/admin/_components/code-editor/PreviewEditorLayout'
import { Button } from '@/components/shadcn/button'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { GET_SUBMISSIONS } from '@/graphql/submission/queries'
import type { ProblemDetail } from '@/types/type'
import { useQuery } from '@apollo/client'
import type { UpdateProblemInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslate } from '@tolgee/react'
import Link from 'next/link'
import { useState, use, useRef } from 'react'
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
import {
  TestcaseField,
  type TestcaseFieldRef
} from '../../_components/TestcaseField'
import { editSchema } from '../../_libs/schemas'
import { EditProblemProvider } from './_components/EditProblemContext'
import { EditProblemForm } from './_components/EditProblemForm'

export default function Page(props: {
  params: Promise<{ problemId: string }>
}) {
  const { t } = useTranslate()
  const params = use(props.params)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const { problemId } = params

  const [isTestcaseEditBlocked, setIsTestcaseEditBlocked] = useState(false)
  const testcaseFieldRef = useRef<TestcaseFieldRef | null>(null)

  const methods = useForm<UpdateProblemInput>({
    resolver: valibotResolver(editSchema),
    defaultValues: { template: [], solution: [] }
  })

  useQuery(GET_SUBMISSIONS, {
    variables: {
      problemId: Number(problemId),
      take: 1
    },
    onCompleted: (data) => {
      if (data.getSubmissions && data.getSubmissions.total > 0) {
        setIsTestcaseEditBlocked(true)
      }
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
            <span className="text-4xl font-bold">
              {t('edit_problem_title')}
            </span>
          </div>
          <EditProblemProvider>
            <EditProblemForm
              problemId={Number(problemId)}
              methods={methods}
              isTestcaseEditBlocked={isTestcaseEditBlocked}
              testcaseFieldRef={testcaseFieldRef}
            >
              <FormSection isFlexColumn title={t('title_section')}>
                <TitleForm placeholder={t('enter_problem_name_placeholder')} />
              </FormSection>

              <FormSection isFlexColumn title={t('description_section')}>
                {methods.getValues('description') && (
                  <DescriptionForm name="description" />
                )}
              </FormSection>

              <div className="flex justify-between gap-2">
                <div>
                  <FormSection
                    isFlexColumn
                    title={t('input_description_section')}
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
                    title={t('output_description_section')}
                    isLabeled={false}
                  >
                    {methods.getValues('outputDescription') && (
                      <DescriptionForm name="outputDescription" />
                    )}
                  </FormSection>
                </div>
              </div>

              <FormSection isFlexColumn title={t('info_section')}>
                <InfoForm />
              </FormSection>

              <TemplateField />

              <SolutionField />

              {methods.getValues('testcases') && (
                <TestcaseField ref={testcaseFieldRef} blockEdit={false} />
              )}

              <FormSection isFlexColumn title={t('limit_section')}>
                <LimitForm blockEdit={false} />
              </FormSection>

              <SwitchField
                name="hint"
                title={t('hint_section')}
                placeholder={t('enter_hint_placeholder')}
                formElement="textarea"
                hasValue={methods.getValues('hint') !== ''}
              />

              <SwitchField
                name="source"
                title={t('source_section')}
                placeholder={t('enter_source_placeholder')}
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
                  <div className="text-base text-[#8a8a8a]">
                    {t('show_preview_button')}
                  </div>
                </Button>
                <Button
                  type="submit"
                  className="flex h-12 w-full items-center gap-2 px-0"
                >
                  <IoIosCheckmarkCircle fontSize={20} />
                  <div className="mb-[2px] text-lg font-bold">
                    {t('edit_button')}
                  </div>
                </Button>
              </div>
            </EditProblemForm>
          </EditProblemProvider>

          {isPreviewing && <PreviewPortal />}
        </main>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </ConfirmNavigation>
  )
}
