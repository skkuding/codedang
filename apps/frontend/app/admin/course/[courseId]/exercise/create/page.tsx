'use client'

import { ConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import { DescriptionForm } from '@/app/admin/_components/DescriptionForm'
import { FormSection } from '@/app/admin/_components/FormSection'
import { Label } from '@/app/admin/_components/Label'
import { SwitchField } from '@/app/admin/_components/SwitchField'
import { TimeForm } from '@/app/admin/_components/TimeForm'
import { TitleForm } from '@/app/admin/_components/TitleForm'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import Link from 'next/link'
import { useState } from 'react'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { TimeFormPopover } from '../../../_components/TimeFormPopover'
import { AssignmentProblemListLabel } from '../../_components/AssignmentProblemListLabel'
import { AssignmentProblemTable } from '../../_components/AssignmentProblemTable'
import { AssignmentSolutionTable } from '../../_components/AssignmentSolutionTable'
import { CreateAssignmentForm } from '../../_components/CreateAssignmentForm'
import { ImportDialog } from '../../_components/ImportDialog'
import { WeekComboBox } from '../../_components/WeekComboBox'
import type { AssignmentProblem } from '../../_libs/type'

export default function Page({ params }: { params: { courseId: string } }) {
  const { courseId } = params
  const [problems, setProblems] = useState<AssignmentProblem[]>([])
  const [isCreating, setIsCreating] = useState(false)

  return (
    <ConfirmNavigation>
      <ScrollArea className="w-full">
        <main className="flex flex-col gap-6 px-[93px] py-[80px]">
          <div className="flex items-center gap-4">
            <Link href={`/admin/course/${courseId}/exercise` as const}>
              <FaAngleLeft className="h-12" />
            </Link>
            <span className="text-[32px] font-bold">CREATE EXERCISE</span>
          </div>

          <CreateAssignmentForm
            groupId={courseId}
            problems={problems}
            setIsCreating={setIsCreating}
            isExercise={true}
          >
            <FormSection
              isFlexColumn={false}
              title="Title"
              className="gap-[77px]"
            >
              <TitleForm placeholder="Name your Exercise" />
            </FormSection>

            <div className="flex flex-col gap-6">
              <div className="flex justify-between">
                <FormSection
                  title="Week"
                  isJustifyBetween={false}
                  className="gap-[67px]"
                >
                  <WeekComboBox name="week" courseId={Number(courseId)} />
                </FormSection>
                <FormSection
                  title="Due Time"
                  isJustifyBetween={false}
                  className="gap-[18px]"
                  isLabeled={false}
                >
                  <TimeFormPopover />
                  <TimeForm
                    name="dueTime"
                    defaultTimeOnSelect={{
                      hours: 23,
                      minutes: 59,
                      seconds: 59
                    }}
                  />
                </FormSection>
              </div>
              <div className="flex justify-between">
                <FormSection
                  title="Start Time"
                  isJustifyBetween={false}
                  className="gap-[27px]"
                >
                  <TimeForm name="startTime" />
                </FormSection>
                <FormSection
                  title="End Time"
                  isJustifyBetween={false}
                  className="gap-[50px]"
                  isLabeled={false}
                >
                  <TimeForm
                    name="endTime"
                    defaultTimeOnSelect={{
                      hours: 23,
                      minutes: 59,
                      seconds: 59
                    }}
                  />
                </FormSection>
              </div>

              <FormSection isFlexColumn title="Description" isLabeled={false}>
                <DescriptionForm name="description" />
              </FormSection>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <AssignmentProblemListLabel />
                  <ImportDialog
                    problems={problems}
                    setProblems={setProblems}
                    target="exercise"
                  />
                </div>
                <AssignmentProblemTable
                  problems={problems}
                  setProblems={setProblems}
                  disableInput={false}
                  isExercise={true}
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <Label required={false}>Solution</Label>
                  <p className="text-[11px] text-[#9B9B9B]">
                    Only problems with solutions are listed below.
                  </p>
                </div>
                <AssignmentSolutionTable
                  problems={problems}
                  setProblems={setProblems}
                />
              </div>

              <div className="flex flex-col gap-1 rounded-md border bg-white p-[20px]">
                <SwitchField
                  hasValue={true}
                  name="isJudgeResultVisible"
                  title="Reveal Hidden Testcase Result"
                  description="When enabled, hidden testcase results will be revealed from students."
                />

                <SwitchField
                  hasValue={true}
                  name="enableCopyPaste"
                  title="Enable Participants Copy/Pasting"
                  description="When enabled, students will be able to copy from or paste into the code editor."
                />
              </div>

              {/* <SwitchField
                name="autoFinalizeScore"
                title="Automatically Finalize Score"
                tooltip={true}
              >
                <p className="text-xs font-normal text-black">
                  Automatically Finalize Score without manual grading
                </p>
              </SwitchField> */}

              <Button
                type="submit"
                className="flex h-[36px] w-full items-center gap-2 px-0"
                disabled={isCreating}
              >
                <IoMdCheckmarkCircleOutline fontSize={20} />
                <div className="mb-[2px] text-base">Create</div>
              </Button>
            </div>
          </CreateAssignmentForm>
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
