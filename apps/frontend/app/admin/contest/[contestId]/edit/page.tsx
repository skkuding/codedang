'use client'

import { ConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import { DescriptionForm } from '@/app/admin/_components/DescriptionForm'
import { FormSection } from '@/app/admin/_components/FormSection'
import { SummaryForm } from '@/app/admin/_components/SummaryForm'
import { SwitchField } from '@/app/admin/_components/SwitchField'
import { TitleForm } from '@/app/admin/_components/TitleForm'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { cn } from '@/libs/utils'
import type { UpdateContestInfo } from '@/types/type'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { TimeForm } from '../../../_components/TimeForm'
import { AddManagerReviewerDialog } from '../../_components/AddManagerReviewerDialog'
import { ContestManagerReviewerTable } from '../../_components/ContestManagerReviewerTable'
import { ContestProblemTable } from '../../_components/ContestProblemTable'
import { CreateEditContestLabel } from '../../_components/CreateEditContestLabel'
import { EnableCopyPasteForm } from '../../_components/EnableCopyPasteForm'
import { FreezeForm } from '../../_components/FreezeForm'
import { ImportDialog } from '../../_components/ImportDialog'
import { PosterUploadForm } from '../../_components/PosterUploadForm'
import { SampleTestcaseForm } from '../../_components/SampleTestcaseForm'
import {
  type ContestManagerReviewer,
  type ContestProblem,
  editSchema
} from '../../_libs/schemas'
import { EditContestForm } from './_components/EditContestForm'

export default function Page({ params }: { params: { contestId: string } }) {
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [managers, setManagers] = useState<ContestManagerReviewer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { contestId } = params

  const methods = useForm<UpdateContestInfo>({
    resolver: valibotResolver(editSchema)
  })

  const participants = methods.watch('contestRecord')
  const endTime = methods.getValues('endTime')
  const freezeTime = methods.getValues('freezeTime')
  const startTime = methods.getValues('startTime')
  const now = new Date().getTime()
  // Check if the contest is Ongoing
  const isOngoing =
    startTime &&
    endTime &&
    now >= new Date(startTime).getTime() &&
    now <= new Date(endTime).getTime()

  // Calculate the difference between the end time and the freeze time
  const diffTime =
    endTime && freezeTime
      ? Math.round(
          (new Date(endTime).getTime() - new Date(freezeTime).getTime()) /
            (1000 * 60)
        )
      : null

  return (
    <ConfirmNavigation>
      <ScrollArea className="w-full">
        <main className="flex flex-col gap-6 px-20 py-16">
          <div className="flex items-center gap-3">
            <Link href="/admin/contest">
              <FaAngleLeft className="h-12" />
            </Link>
            <span className="text-[32px] font-bold">Edit Contest</span>
          </div>

          <EditContestForm
            contestId={Number(contestId)}
            problems={problems}
            managers={managers}
            setProblems={setProblems}
            setManagers={setManagers}
            setIsLoading={setIsLoading}
            methods={methods}
          >
            <div className="flex justify-between gap-[26px]">
              {methods.getValues('posterUrl') !== undefined && (
                <PosterUploadForm name="posterUrl" disabled={isOngoing} />
              )}

              <div className="flex flex-col justify-between">
                <FormSection title="Title" disabled={isOngoing}>
                  <TitleForm
                    placeholder="Name your contest"
                    className="max-w-[492px]"
                  />
                </FormSection>
                <FormSection title="Start Time" disabled={isOngoing}>
                  {methods.getValues('startTime') && (
                    <TimeForm isContest name="startTime" />
                  )}
                </FormSection>
                <FormSection title="End Time">
                  {methods.getValues('endTime') && (
                    <TimeForm isContest name="endTime" />
                  )}
                </FormSection>

                {methods.getValues('freezeTime') !== undefined && (
                  <FreezeForm
                    name="freezeTime"
                    hasValue={methods.getValues('freezeTime') !== null}
                    isEdit={true}
                    isOngoing={isOngoing}
                    diffTime={diffTime}
                  />
                )}
              </div>
            </div>

            <FormSection
              title="Summary"
              isLabeled={false}
              isFlexColumn
              disabled={isOngoing}
            >
              <SummaryForm name="summary" />
            </FormSection>

            <FormSection
              title="More Description"
              isLabeled={false}
              isFlexColumn={true}
              disabled={isOngoing}
            >
              {methods.getValues('description') !== undefined && (
                <DescriptionForm name="description" />
              )}
            </FormSection>

            <div className="flex h-full min-h-[114px] w-full flex-col justify-center gap-3 rounded-xl border bg-[#8080800D] px-10 py-[27px]">
              {methods.getValues('evaluateWithSampleTestcase') !==
                undefined && (
                <SampleTestcaseForm
                  name="evaluateWithSampleTestcase"
                  title="Evaluate with sample testcases included"
                  hasValue={
                    methods.getValues('evaluateWithSampleTestcase') !== false
                  }
                  disabled={isOngoing}
                />
              )}
              <SwitchField
                name="invitationCode"
                title="Invitation Code"
                type="number"
                formElement="input"
                placeholder="Enter a invitation code"
                hasValue={methods.getValues('invitationCode') !== null}
                disabled={isOngoing}
              />
              {methods.getValues('enableCopyPaste') !== undefined && (
                <EnableCopyPasteForm
                  name="enableCopyPaste"
                  title="Enable Copy Paste"
                  hasValue={methods.getValues('enableCopyPaste') !== false}
                  disabled={isOngoing}
                />
              )}
            </div>

            <div
              className={cn(
                'flex flex-col gap-1',
                isOngoing && 'pointer-events-none opacity-50'
              )}
            >
              <div className="flex items-center justify-between">
                <CreateEditContestLabel
                  title="Add manager / reviewer"
                  content={`Contest managers have all permissions except for creating and editing the contest.\nYou can also import problems created by the contest manager into this contest.\nContest reviewers can view the problem list before the contest starts.`}
                />
                <AddManagerReviewerDialog
                  managers={managers}
                  setManagers={setManagers}
                  participants={participants}
                />
              </div>
              <ContestManagerReviewerTable
                managers={managers}
                setManagers={setManagers}
              />
            </div>

            <div
              className={cn(
                'flex flex-col gap-1',
                isOngoing && 'pointer-events-none opacity-50'
              )}
            >
              <div className="flex items-center justify-between">
                <CreateEditContestLabel
                  title="Contest Problem List"
                  content={`If contest problems are imported from the ‘All Problem List’,<br>the problems will automatically become invisible state.<br>After the contests are all over, you can manually make the problem visible again.`}
                />
                <ImportDialog problems={problems} setProblems={setProblems} />
              </div>
              <ContestProblemTable
                problems={problems}
                setProblems={setProblems}
                disableInput={false}
              />
            </div>

            <div className="space-y-2">
              {isOngoing && (
                <p className="text-error text-sm">
                  * You can only edit{' '}
                  <strong className="font-bold">End Time</strong> and{' '}
                  <strong className="font-bold">Freeze Time</strong> for an
                  Ongoing Contest.
                  <br />* Ensure the{' '}
                  <strong className="font-bold">Freeze Start Time</strong> is
                  after the <strong className="font-bold">Current Time</strong>,
                  and the{' '}
                  <strong className="font-bold">
                    Original Freeze Start Time
                  </strong>
                  .
                </p>
              )}

              <Button
                type="submit"
                className="flex h-[36px] w-full items-center gap-2 px-0"
                disabled={isLoading}
              >
                <IoMdCheckmarkCircleOutline fontSize={20} />
                <div className="mb-[2px] text-base">Edit</div>
              </Button>
            </div>
          </EditContestForm>
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
