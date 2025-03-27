'use client'

import { ConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import { DescriptionForm } from '@/app/admin/_components/DescriptionForm'
import { FormSection } from '@/app/admin/_components/FormSection'
import { SummaryForm } from '@/app/admin/_components/SummaryForm'
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
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { TimeForm } from '../../../_components/TimeForm'
import { AddManagerReviewerDialog } from '../../_components/AddManagerReviewerDialog'
import { ContestManagerReviewerTable } from '../../_components/ContestManagerReviewerTable'
import { ContestProblemTable } from '../../_components/ContestProblemTable'
import { CreateEditContestLabel } from '../../_components/CreateEditContestLabel'
import { ImportDialog } from '../../_components/ImportDialog'
import {
  type ContestManagerReviewer,
  type ContestProblem,
  editSchema
} from '../../_libs/schemas'
import { FreezeForm } from '../../create/_components/FreezeForm'
import { PosterUploadForm } from '../../create/_components/PosterUploadForm'
import { SampleTestcaseForm } from '../../create/_components/SampleTestcaseForm'
import { EditContestForm } from './_components/EditContestForm'

export default function Page({ params }: { params: { contestId: string } }) {
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [managers, setManagers] = useState<ContestManagerReviewer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { contestId } = params

  const methods = useForm<UpdateContestInput>({
    resolver: valibotResolver(editSchema)
  })

  const endTime = methods.getValues('endTime')
  const freezeTime = methods.getValues('freezeTime')

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
              <PosterUploadForm name="posterUrl" />

              <div className="flex flex-col justify-between">
                <FormSection title="Title">
                  <TitleForm placeholder="Name your contest" />
                </FormSection>
                <FormSection title="Start Time">
                  {methods.getValues('startTime') && (
                    <TimeForm name="startTime" />
                  )}
                </FormSection>
                <FormSection title="End Time">
                  {methods.getValues('endTime') && <TimeForm name="endTime" />}
                </FormSection>

                {methods.getValues('freezeTime') !== undefined && (
                  <FreezeForm
                    name="freezeTime"
                    hasValue={methods.getValues('freezeTime') !== null}
                    isEdit={true}
                    diffTime={diffTime}
                  />
                )}
              </div>
            </div>

            <FormSection title="Summary" isLabeled={false} isFlexColumn={true}>
              <SummaryForm name="summary" />
            </FormSection>

            <FormSection
              title="More Description"
              isLabeled={false}
              isFlexColumn={true}
            >
              {methods.getValues('description') && (
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
                />
              )}
              <SwitchField
                name="invitationCode"
                title="Invitation Code"
                type="number"
                formElement="input"
                placeholder="Enter a invitation code"
                hasValue={methods.getValues('invitationCode') !== null}
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <CreateEditContestLabel
                  title="Add manager / reviewer"
                  content={`Contest managers have all permissions except for creating and editing the contest.\nYou can also import problems created by the contest manager into this contest.\nContest reviewers can view the problem list before the contest starts.`}
                />
                <AddManagerReviewerDialog
                  managers={managers}
                  setManagers={setManagers}
                />
              </div>
              <ContestManagerReviewerTable
                managers={managers}
                setManagers={setManagers}
              />
            </div>

            <div className="flex flex-col gap-1">
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

            <Button
              type="submit"
              className="flex h-[36px] w-full items-center gap-2 px-0"
              disabled={isLoading}
            >
              <IoMdCheckmarkCircleOutline fontSize={20} />
              <div className="mb-[2px] text-base">Edit</div>
            </Button>
          </EditContestForm>
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
