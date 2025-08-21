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
import type { ContestPreview } from '@/types/type'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Link from 'next/link'
import { useState, use } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { MdTextSnippet } from 'react-icons/md'
import { toast } from 'sonner'
import { TimeForm } from '../../../_components/TimeForm'
import { AddManagerReviewerDialog } from '../../_components/AddManagerReviewerDialog'
import { ContestManagerReviewerTable } from '../../_components/ContestManagerReviewerTable'
import { ContestProblemTable } from '../../_components/ContestProblemTable'
import { CreateEditContestLabel } from '../../_components/CreateEditContestLabel'
import { DisableCopyPasteForm } from '../../_components/DisableCopyPasteForm'
import { FreezeForm } from '../../_components/FreezeForm'
import { ImportProblemDialog } from '../../_components/ImportProblemDialog'
import { PosterUploadForm } from '../../_components/PosterUploadForm'
import { PreviewOverviewLayout } from '../../_components/PreviewOverviewLayout'
import { SampleTestcaseForm } from '../../_components/SampleTestcaseForm'
import {
  type ContestManagerReviewer,
  type ContestProblem,
  editSchema
} from '../../_libs/schemas'
import { ContestEditEndTimeForm } from './_components/ContestEditEndTimeForm'
import { EditContestForm } from './_components/EditContestForm'

export default function Page(props: {
  params: Promise<{ contestId: string }>
}) {
  const params = use(props.params)
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [managers, setManagers] = useState<ContestManagerReviewer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const { contestId } = params

  const methods = useForm<UpdateContestInfo>({
    resolver: valibotResolver(editSchema)
  })
  const PreviewContestPortal = () => {
    const contest = {
      id: 1,
      title: methods.getValues('title'),
      startTime: methods.getValues('startTime'),
      endTime: methods.getValues('endTime'),
      summary: methods.getValues('summary'),
      description: methods.getValues('description') ?? '',
      posterUrl: methods.getValues('posterUrl') ?? '/logos/welcome.png',
      status: 'upcoming',
      problems
    } as ContestPreview

    return createPortal(
      <div className="fixed inset-0 z-50 flex bg-white">
        <PreviewOverviewLayout
          contest={contest}
          exitPreview={() => setIsPreviewing(false)}
        />
      </div>,
      document.body
    )
  }

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
  // Check if the contest is Finished
  const isFinished = endTime && now > new Date(endTime).getTime()
  // Calculate the difference between the end time and the freeze time
  const diffTime =
    endTime && freezeTime
      ? Math.round(
          (new Date(endTime).getTime() - new Date(freezeTime).getTime()) /
            (1000 * 60)
        )
      : null
  // console.log(methods.getValues())
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
                <PosterUploadForm
                  name="posterUrl"
                  disabled={isOngoing || isFinished}
                />
              )}

              <div className="flex flex-col justify-between">
                <FormSection
                  title="Title"
                  isOngoing={isOngoing}
                  isFinished={isFinished}
                >
                  <TitleForm
                    placeholder="Name your contest"
                    className="max-w-[492px]"
                  />
                </FormSection>
                <FormSection
                  title="Join DueTime"
                  isOngoing={isOngoing}
                  isFinished={isFinished}
                >
                  {methods.getValues('registerDueTime') && (
                    <TimeForm isContest name="registerDueTime" />
                  )}
                </FormSection>
                <FormSection
                  title="Start Time"
                  isOngoing={isOngoing}
                  isFinished={isFinished}
                >
                  {methods.getValues('startTime') && (
                    <TimeForm isContest name="startTime" />
                  )}
                </FormSection>
                <FormSection title="End Time" isFinished={isFinished}>
                  {methods.getValues('endTime') && (
                    <ContestEditEndTimeForm
                      name="endTime"
                      isOngoing={isOngoing}
                    />
                  )}
                </FormSection>

                {methods.getValues('freezeTime') !== undefined && (
                  <FreezeForm
                    name="freezeTime"
                    hasValue={methods.getValues('freezeTime') !== null}
                    isEdit={true}
                    isOngoing={isOngoing}
                    diffTime={diffTime}
                    isFinished={isFinished}
                  />
                )}
              </div>
            </div>

            <FormSection
              title="Summary"
              isLabeled={false}
              isFlexColumn
              isOngoing={isOngoing}
              isFinished={isFinished}
            >
              <SummaryForm name="summary" />
            </FormSection>

            <FormSection
              title="More Description"
              isLabeled={false}
              isFlexColumn={true}
              isOngoing={isOngoing}
              isFinished={isFinished}
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
                  isOngoing={isOngoing}
                  isFinished={isFinished}
                />
              )}
              <SwitchField
                name="invitationCode"
                title="Invitation Code"
                type="number"
                formElement="input"
                placeholder="Enter a invitation code"
                hasValue={methods.getValues('invitationCode') !== null}
                disabled={isOngoing || isFinished}
              />
              {methods.getValues('enableCopyPaste') !== undefined && (
                <DisableCopyPasteForm
                  name="enableCopyPaste"
                  title="Disable Copy/Paste"
                  hasValue={methods.getValues('enableCopyPaste') !== false}
                  disabled={isOngoing || isFinished}
                />
              )}
            </div>

            <div
              className={cn(
                'flex flex-col gap-1',
                isOngoing && 'pointer-events-none opacity-50',
                isFinished && 'pointer-events-none'
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
                isOngoing && 'pointer-events-none opacity-50',
                isFinished && 'pointer-events-none'
              )}
            >
              <div className="flex items-center justify-between">
                <CreateEditContestLabel
                  title="Contest Problem List"
                  content={`If contest problems are imported from the ‘All Problem List’,<br>the problems will automatically become invisible state.<br>After the contests are all over, you can manually make the problem visible again.`}
                />
                <ImportProblemDialog
                  problems={problems}
                  setProblems={setProblems}
                  contestId={contestId}
                />
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
                  <br />* <strong className="font-bold">End Time</strong> must
                  be after the{' '}
                  <strong className="font-bold">Original End Time</strong>.
                  <br />*{' '}
                  <strong className="font-bold">Freeze Start Time</strong> must
                  be after the{' '}
                  <strong className="font-bold">Current Time</strong>, and the{' '}
                  <strong className="font-bold">
                    Original Freeze Start Time
                  </strong>
                  .
                </p>
              )}
              {isFinished && (
                <p className="text-error text-sm">
                  * You cannot edit the contest after it is finished.
                </p>
              )}
              <div className="flex flex-col gap-5">
                <Button
                  type="button"
                  variant={'slate'}
                  className="bg-fill hover:bg-fill-neutral flex h-[48px] w-full items-center gap-2 px-0"
                  onClick={async () => {
                    const isValid = await methods.trigger()
                    if (isValid) {
                      setIsPreviewing(true)
                    } else {
                      toast.error('Please fill in all required fields.')
                    }
                  }}
                >
                  <MdTextSnippet fontSize={20} className="text-[#8a8a8a]" />
                  <div className="text-base text-[#8a8a8a]">Show Preview</div>
                </Button>
                <Button
                  type="submit"
                  className="flex h-12 w-full items-center gap-2 px-0"
                  disabled={isLoading || isFinished}
                >
                  <IoIosCheckmarkCircle fontSize={20} />
                  <div className="mb-[2px] text-lg font-bold">Edit</div>
                </Button>
              </div>
            </div>
          </EditContestForm>
          {isPreviewing && <PreviewContestPortal />}
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
