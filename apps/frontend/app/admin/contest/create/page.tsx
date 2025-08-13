'use client'

import { createSchema } from '@/app/admin/contest/_libs/schemas'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import type { ContestPreview } from '@/types/type'
import type { CreateContestInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Link from 'next/link'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { MdTextSnippet } from 'react-icons/md'
import { toast } from 'sonner'
import { ConfirmNavigation } from '../../_components/ConfirmNavigation'
import { DescriptionForm } from '../../_components/DescriptionForm'
import { FormSection } from '../../_components/FormSection'
import { SummaryForm } from '../../_components/SummaryForm'
import { SwitchField } from '../../_components/SwitchField'
import { TimeForm } from '../../_components/TimeForm'
import { TitleForm } from '../../_components/TitleForm'
import { AddManagerReviewerDialog } from '../_components/AddManagerReviewerDialog'
import { ContestManagerReviewerTable } from '../_components/ContestManagerReviewerTable'
import { ContestProblemTable } from '../_components/ContestProblemTable'
import { CreateEditContestLabel } from '../_components/CreateEditContestLabel'
import { DisableCopyPasteForm } from '../_components/DisableCopyPasteForm'
import { FreezeForm } from '../_components/FreezeForm'
import { ImportProblemDialog } from '../_components/ImportProblemDialog'
import { PosterUploadForm } from '../_components/PosterUploadForm'
import { PreviewOverviewLayout } from '../_components/PreviewOverviewLayout'
import { SampleTestcaseForm } from '../_components/SampleTestcaseForm'
import type { ContestManagerReviewer, ContestProblem } from '../_libs/schemas'
import { CreateContestForm } from './_components/CreateContestForm'

export default function Page() {
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [managers, setManagers] = useState<ContestManagerReviewer[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const methods = useForm<CreateContestInput>({
    resolver: valibotResolver(createSchema),
    defaultValues: {
      invitationCode: null,
      enableCopyPaste: true,
      isJudgeResultVisible: true,
      description: null
    }
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

  return (
    <ConfirmNavigation>
      <ScrollArea className="w-full">
        <main className="flex flex-col gap-6 px-20 py-16">
          <div className="flex items-center gap-3">
            <Link href="/admin/contest">
              <FaAngleLeft className="h-12" />
            </Link>
            <span className="text-[32px] font-bold">CREATE CONTEST</span>
          </div>

          <CreateContestForm
            methods={methods}
            managers={managers}
            problems={problems}
            setIsCreating={setIsCreating}
          >
            <div className="flex justify-between gap-[26px]">
              <PosterUploadForm name="posterUrl" />

              <div className="flex flex-col justify-between">
                <FormSection title="Title">
                  <TitleForm
                    placeholder="Name your contest"
                    className="max-w-[492px]"
                  />
                </FormSection>
                <FormSection title="Join DueTime">
                  <TimeForm isContest name="registerDueTime" />
                </FormSection>
                <FormSection title="Start Time">
                  <TimeForm isContest name="startTime" />
                </FormSection>
                <FormSection title="End Time">
                  <TimeForm isContest name="endTime" />
                </FormSection>
                <FreezeForm name="freezeTime" />
              </div>
            </div>

            <FormSection title="Summary" isLabeled={false} isFlexColumn>
              <SummaryForm name="summary" />
            </FormSection>

            <FormSection
              title="More Description"
              isLabeled={false}
              isFlexColumn={true}
            >
              <DescriptionForm name="description" />
            </FormSection>

            <div className="flex h-full min-h-[114px] w-full flex-col justify-center gap-3 rounded-xl border bg-[#8080800D] px-10 py-[27px]">
              <SampleTestcaseForm
                name="evaluateWithSampleTestcase"
                title="Evaluate with sample testcases included"
              />
              <SwitchField
                name="invitationCode"
                title="Invitation Code"
                type="number"
                formElement="input"
                placeholder="Enter a invitation code"
              />
              <DisableCopyPasteForm
                name="enableCopyPaste"
                title="Disable Copy/Paste"
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
                <ImportProblemDialog
                  problems={problems}
                  setProblems={setProblems}
                />
              </div>
              <ContestProblemTable
                problems={problems}
                setProblems={setProblems}
                disableInput={false}
              />
            </div>

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
                disabled={isCreating}
              >
                <IoIosCheckmarkCircle fontSize={20} />
                <div className="mb-[2px] text-lg font-bold">Create</div>
              </Button>
            </div>
          </CreateContestForm>
          {isPreviewing && <PreviewContestPortal />}
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
