'use client'

import { PreviewEditorLayout } from '@/app/admin/_components/code-editor/PreviewEditorLayout'
import { createSchema } from '@/app/admin/problem/_libs/schemas'
import { Button } from '@/components/shadcn/button'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { languages as allLanguages } from '@/libs/constants'
import { useSession } from '@/libs/hooks/useSession'
import type { ProblemDetail } from '@/types/type'
import { Level, type CreateProblemInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { MdTextSnippet } from 'react-icons/md'
import { toast } from 'sonner'
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
import {
  BAEKJOON_EXTENSION_MESSAGE_TYPE,
  baekjoonPayloadToFormValues,
  type BaekjoonPayload
} from './_libs/baekjoon'

export default function Page() {
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const session = useSession()
  const isAdmin = session?.user?.role !== 'User'
  const testcaseFieldRef = useRef<TestcaseFieldRef | null>(null)

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

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.source !== window) {
        return
      }
      if (event.data?.type !== BAEKJOON_EXTENSION_MESSAGE_TYPE) {
        return
      }
      const payload = event.data.payload as BaekjoonPayload | undefined
      if (!payload?.title) {
        return
      }
      try {
        const imported = baekjoonPayloadToFormValues(payload)
        const current = methods.getValues()
        const next = {
          ...current,
          ...imported,
          languages: [...allLanguages] as CreateProblemInput['languages']
        }
        methods.reset(next)
        setFormKey((prev) => prev + 1)
        toast.success('Baekjoon problem data applied')
      } catch {
        toast.error('Failed to apply Baekjoon problem data')
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [methods])

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
            <span className="text-4xl font-bold">CREATE PROBLEM</span>
          </div>

          <CreateProblemForm
            methods={methods}
            testcaseFieldRef={testcaseFieldRef}
          >
            <div key={`form-${formKey}`} className="flex flex-col gap-6">
              <FormSection isFlexColumn title="Title">
                <TitleForm placeholder="Enter a problem name" />
              </FormSection>

              <FormSection isFlexColumn title="Description">
                <DescriptionForm name="description" />
              </FormSection>

              <div className="flex gap-2">
                <div className="flex-1">
                  <FormSection
                    isLabeled={false}
                    isFlexColumn
                    title="Input Description"
                  >
                    <DescriptionForm name="inputDescription" />
                  </FormSection>
                </div>
                <div className="flex-1">
                  <FormSection
                    isLabeled={false}
                    isFlexColumn
                    title="Output Description"
                  >
                    <DescriptionForm name="outputDescription" />
                  </FormSection>
                </div>
              </div>

              <TestcaseField ref={testcaseFieldRef} />

              <FormSection isFlexColumn title="Info">
                <InfoForm />
              </FormSection>

              <TemplateField />

              <SolutionField />

              <FormSection isFlexColumn title="Limit">
                <LimitForm />
              </FormSection>

              <SwitchField
                name="hint"
                title="Hint"
                formElement="textarea"
                placeholder="Enter a hint"
                hasValue={Boolean(methods.watch('hint'))}
              />

              <SwitchField
                name="source"
                title="Source"
                placeholder="Enter a source"
                formElement="input"
                hasValue={Boolean(methods.watch('source'))}
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
                  <div className="mb-[2px] text-lg font-bold">Create</div>
                </Button>
              </div>
            </div>
          </CreateProblemForm>
          {isPreviewing && <PreviewPortal />}
        </main>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </ConfirmNavigation>
  )
}
