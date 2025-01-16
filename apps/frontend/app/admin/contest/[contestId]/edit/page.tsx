'use client'

import { ConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import { DescriptionForm } from '@/app/admin/_components/DescriptionForm'
import { FormSection } from '@/app/admin/_components/FormSection'
import { SwitchField } from '@/app/admin/_components/SwitchField'
import { TitleForm } from '@/app/admin/_components/TitleForm'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import type { UpdateContestInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { ContestProblemListLabel } from '../../_components/ContestProblemListLabel'
import { ContestProblemTable } from '../../_components/ContestProblemTable'
import { ImportDialog } from '../../_components/ImportDialog'
import { TimeForm } from '../../_components/TimeForm'
import { type ContestProblem, editSchema } from '../../_libs/schemas'
import EditContestForm from './_components/EditContestForm'

export default function Page({ params }: { params: { contestId: string } }) {
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { contestId } = params

  const methods = useForm<UpdateContestInput>({
    resolver: valibotResolver(editSchema),
    defaultValues: {
      isRankVisible: true,
      isVisible: true
    }
  })

  return (
    <ConfirmNavigation>
      <ScrollArea className="w-full">
        <main className="flex flex-col gap-6 px-20 py-16">
          <div className="flex items-center gap-4">
            <Link href="/admin/contest">
              <FaAngleLeft className="h-12" />
            </Link>
            <span className="text-4xl font-bold">Edit Contest</span>
          </div>

          <EditContestForm
            contestId={Number(contestId)}
            problems={problems}
            setProblems={setProblems}
            setIsLoading={setIsLoading}
            methods={methods}
          >
            <FormSection title="Title">
              <TitleForm placeholder="Name your contest" />
            </FormSection>

            <div className="flex gap-6">
              <FormSection title="Start Time">
                {methods.getValues('startTime') && (
                  <TimeForm name="startTime" />
                )}
              </FormSection>
              <FormSection title="End Time">
                {methods.getValues('endTime') && <TimeForm name="endTime" />}
              </FormSection>
            </div>

            <FormSection title="Description">
              {methods.getValues('description') && (
                <DescriptionForm name="description" />
              )}
            </FormSection>

            <SwitchField
              name="enableCopyPaste"
              title="Enable participants Copy/Pasting"
              hasValue={methods.getValues('enableCopyPaste') || false}
            />

            <SwitchField
              name="isJudgeResultVisible"
              title="Reveal scores to participants"
              hasValue={methods.getValues('isJudgeResultVisible') || false}
            />

            <SwitchField
              name="invitationCode"
              title="Invitation Code"
              type="number"
              formElement="input"
              placeholder="Enter a invitation code"
              hasValue={methods.getValues('invitationCode') !== null}
            />

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <ContestProblemListLabel />
                <ImportDialog problems={problems} setProblems={setProblems} />
              </div>
              <ContestProblemTable
                problems={problems}
                setProblems={setProblems}
                disableInput={false}
              />
            </div>

            <Button
              type="submit"
              className="flex h-[36px] w-[90px] items-center gap-2 px-0"
              disabled={isLoading}
            >
              <IoIosCheckmarkCircle fontSize={20} />
              <div className="text-base">Edit</div>
            </Button>
          </EditContestForm>
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
