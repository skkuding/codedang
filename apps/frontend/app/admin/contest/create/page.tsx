'use client'

import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import Link from 'next/link'
import { useState } from 'react'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { ConfirmNavigation } from '../../_components/ConfirmNavigation'
import { DescriptionForm } from '../../_components/DescriptionForm'
import { FormSection } from '../../_components/FormSection'
import { SummaryForm } from '../../_components/SummaryForm'
import { SwitchField } from '../../_components/SwitchField'
import { TimeForm } from '../../_components/TimeForm'
import { TitleForm } from '../../_components/TitleForm'
import { ContestProblemTable } from '../_components/ContestProblemTable'
import { CreateContestLabel } from '../_components/CreateContestLabel'
import { ImportDialog } from '../_components/ImportDialog'
import type { ContestProblem } from '../_libs/schemas'
import { CreateContestForm } from './_components/CreateContestForm'
import { ImageUploadSection } from './_components/ImageUploadSection'

export default function Page() {
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [isCreating, setIsCreating] = useState(false)

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

          <CreateContestForm problems={problems} setIsCreating={setIsCreating}>
            <div className="flex justify-between gap-[26px]">
              <ImageUploadSection />
              <div className="flex flex-col justify-between">
                <FormSection title="Title">
                  <TitleForm placeholder="Name your contest" />
                </FormSection>
                <FormSection title="Start Time">
                  <TimeForm name="startTime" />
                </FormSection>
                <FormSection title="End Time">
                  <TimeForm name="endTime" />
                </FormSection>
                <div className="h-[114px] w-[641px] rounded-xl border">
                  {/* Temporary Leaderboard Freeze div */}
                </div>
              </div>
            </div>

            <FormSection title="Summary" isLabeled={false} isFlexColumn={true}>
              {/* <DescriptionForm name="description" /> */}
              <SummaryForm name="Summary" />
            </FormSection>

            <FormSection
              title="More Description"
              isLabeled={false}
              isFlexColumn={true}
            >
              <DescriptionForm name="description" />
            </FormSection>

            <div className="flex h-[114px] w-full flex-col justify-center gap-3 rounded-xl border bg-[#8080800D] px-10">
              {/* Temporary Switch Field for Evaluate with sample Testcases included */}
              <SwitchField
                name="invitationCode"
                title="Invitation Code"
                type="number"
                formElement="input"
                placeholder="Enter a invitation code"
              />
              <SwitchField
                name="invitationCode"
                title="Invitation Code"
                type="number"
                formElement="input"
                placeholder="Enter a invitation code"
              />
            </div>

            {/* <SwitchField
              name="enableCopyPaste"
              title="Enable participants Copy/Pasting"
            />

            <SwitchField
              name="isJudgeResultVisible"
              title="Reveal scores to participants"
            /> */}

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <CreateContestLabel
                  title="Add manager / reviewer"
                  content={`Contest managers have all permissions except for creating and editing the contest.\nYou can also import problems created by the contest manager into this contest.\nContest reviewers can view the problem list before the contest starts.`}
                />
                <ImportDialog problems={problems} setProblems={setProblems} />
              </div>
              {/* 임시로 ContestProblemTabnle 넣어놓음 */}
              <ContestProblemTable
                problems={problems}
                setProblems={setProblems}
                disableInput={false}
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <CreateContestLabel
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
              disabled={isCreating}
            >
              <IoMdCheckmarkCircleOutline fontSize={20} />
              <div className="mb-[2px] text-base">Create</div>
            </Button>
          </CreateContestForm>
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
