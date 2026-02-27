'use client'

import { PreviewEditorLayout } from '@/app/admin/_components/code-editor/PreviewEditorLayout'
import { createSchema } from '@/app/admin/problem/_libs/schemas'
import { Button } from '@/components/shadcn/button'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { useSession } from '@/libs/hooks/useSession'
import type { ProblemDetail } from '@/types/type'
import { Level, type CreateProblemInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslate } from '@tolgee/react'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { MdTextSnippet } from 'react-icons/md'
import { ConfirmNavigation } from '../../_components/ConfirmNavigation'
import { DescriptionForm } from '../../_components/DescriptionForm'
import { FormSection } from '../../_components/FormSection'
import { SwitchField } from '../../_components/SwitchField'
import { TitleForm } from '../../_components/TitleForm'
import { InfoForm } from '../_components/InfoForm'
import { LimitForm } from '../_components/LimitForm'
import { SolutionField } from '../_components/SolutionField'
import { TemplateField } from '../_components/TemplateField'
import {
  TestcaseField,
  type TestcaseFieldRef
} from '../_components/TestcaseField'
import { CreateProblemForm } from './_components/CreateProblemForm'

export default function Page() {
  const [isPreviewing, setIsPreviewing] = useState(false)
  const session = useSession()
  const isAdmin = session?.user?.role !== 'User'
  const testcaseFieldRef = useRef<TestcaseFieldRef | null>(null)
  const { t } = useTranslate()

  const methods = useForm<CreateProblemInput>({
    resolver: valibotResolver(createSchema),
    defaultValues: {
      difficulty: Level.Level1,
      tagIds: [],
      inputDescription: '',
      outputDescription: '',
      testcases: [
        { input: '', output: '', isHidden: false, scoreWeight: undefined }
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
        <main className="flex w-full flex-col gap-6 px-20 py-16">
          <div className="-ml-8 flex items-center gap-4">
            <Link href="/admin/problem">
              <FaAngleLeft className="h-12 hover:text-gray-700/80" />
            </Link>
            <span className="text-4xl font-bold">
              {t('create_problem_title')}
            </span>
          </div>

          <CreateProblemForm
            methods={methods}
            testcaseFieldRef={testcaseFieldRef}
          >
            <FormSection isFlexColumn title={t('form_section_title')}>
              <TitleForm placeholder={t('title_form_placeholder')} />
            </FormSection>

            <FormSection isFlexColumn title={t('description_section_title')}>
              <DescriptionForm name="description" />
            </FormSection>

            <div className="flex justify-between gap-2">
              <div>
                <FormSection
                  isLabeled={false}
                  isFlexColumn
                  title={t('input_description_section_title')}
                >
                  <DescriptionForm name="inputDescription" />
                </FormSection>
              </div>
              <div>
                <FormSection
                  isLabeled={false}
                  isFlexColumn
                  title={t('output_description_section_title')}
                >
                  <DescriptionForm name="outputDescription" />
                </FormSection>
              </div>
            </div>

            <TestcaseField ref={testcaseFieldRef} />

            <FormSection isFlexColumn title={t('info_section_title')}>
              <InfoForm />
            </FormSection>

            <TemplateField />

            <SolutionField />

            <FormSection isFlexColumn title={t('limit_section_title')}>
              <LimitForm />
            </FormSection>

            <SwitchField
              name="hint"
              title={t('hint_field_title')}
              formElement="textarea"
              placeholder={t('hint_field_placeholder')}
            />

            <SwitchField
              name="source"
              title={t('source_field_title')}
              placeholder={t('source_field_placeholder')}
              formElement="input"
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
                  {t('create_button')}
                </div>
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
