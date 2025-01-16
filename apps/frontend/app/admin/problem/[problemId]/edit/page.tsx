'use client'

import ConfirmNavigation from '@/app/admin/_components/ConfirmNavigation'
import { Button } from '@/components/shadcn/button'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import type { UpdateProblemInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { DescriptionForm } from '../../../_components/DescriptionForm'
import { FormSection } from '../../../_components/FormSection'
import { SwitchField } from '../../../_components/SwitchField'
import { TitleForm } from '../../../_components/TitleForm'
import { VisibleForm } from '../../../_components/VisibleForm'
import { CautionDialog } from '../../_components/CautionDialog'
import { InfoForm } from '../../_components/InfoForm'
import { LimitForm } from '../../_components/LimitForm'
import { PopoverVisibleInfo } from '../../_components/PopoverVisibleInfo'
import { TemplateField } from '../../_components/TemplateField'
import { TestcaseField } from '../../_components/TestcaseField'
import { editSchema } from '../../_libs/schemas'
import EditProblemForm from './_components/EditProblemForm'

export default function Page({ params }: { params: { problemId: string } }) {
  const { problemId } = params

  const methods = useForm<UpdateProblemInput>({
    resolver: valibotResolver(editSchema),
    defaultValues: { template: [] }
  })

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
              <FormSection title="Title">
                <TitleForm placeholder="Enter a problem name" />
              </FormSection>

              <FormSection title="Visible">
                <PopoverVisibleInfo />
                <VisibleForm
                  blockEdit={methods.getValues('isVisible') === null}
                />
              </FormSection>
            </div>

            <FormSection title="Info">
              <InfoForm />
            </FormSection>

            <FormSection title="Description">
              {methods.getValues('description') && (
                <DescriptionForm name="description" />
              )}
            </FormSection>

            <div className="flex justify-between">
              <div className="w-[360px]">
                <FormSection title="Input Description">
                  {methods.getValues('inputDescription') && (
                    <DescriptionForm name="inputDescription" />
                  )}
                </FormSection>
              </div>
              <div className="w-[360px]">
                <FormSection title="Output Description">
                  {methods.getValues('outputDescription') && (
                    <DescriptionForm name="outputDescription" />
                  )}
                </FormSection>
              </div>
            </div>

            {methods.getValues('testcases') && (
              <TestcaseField blockEdit={false} />
            )}

            <FormSection title="Limit">
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

            <Button
              type="submit"
              className="flex h-[36px] w-[90px] items-center gap-2 px-0"
            >
              <IoIosCheckmarkCircle fontSize={20} />
              <div className="text-base">Edit</div>
            </Button>
          </EditProblemForm>
        </main>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </ConfirmNavigation>
  )
}
