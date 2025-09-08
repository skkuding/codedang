'use client'

import { ConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import { DescriptionForm } from '@/app/admin/_components/DescriptionForm'
import { FormSection } from '@/app/admin/_components/FormSection'
import { Label } from '@/app/admin/_components/Label'
import { SwitchField } from '@/app/admin/_components/SwitchField'
import { TimeForm } from '@/app/admin/_components/TimeForm'
import { TitleForm } from '@/app/admin/_components/TitleForm'
import { TimeFormPopover } from '@/app/admin/course/_components/TimeFormPopover'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import type { UpdateAssignmentInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { AssignmentProblemListLabel } from '../../../_components/AssignmentProblemListLabel'
import { AssignmentProblemTable } from '../../../_components/AssignmentProblemTable'
import { AssignmentSolutionTable } from '../../../_components/AssignmentSolutionTable'
import { EditAssignmentForm } from '../../../_components/EditAssignmentForm'
import { ImportProblemDialog } from '../../../_components/ImportProblemDialog'
import { WeekComboBox } from '../../../_components/WeekComboBox'
import { editSchema } from '../../../_libs/schemas'
import type { AssignmentProblem } from '../../../_libs/type'

export default function Page() {
  const [problems, setProblems] = useState<AssignmentProblem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { courseId, assignmentId } = useParams()

  const methods = useForm<UpdateAssignmentInput>({
    resolver: valibotResolver(editSchema),
    defaultValues: {
      isRankVisible: true,
      isVisible: true
    }
  })

  return (
    <ConfirmNavigation>
      <ScrollArea className="w-full">
        <main className="flex flex-col gap-6 px-[93px] py-[80px]">
          <div className="flex items-center gap-4">
            <Link href={`/admin/course/${courseId}/assignment` as const}>
              <FaAngleLeft className="h-12" />
            </Link>
            <span className="text-4xl font-bold">EDIT ASSIGNMENT</span>
          </div>

          <EditAssignmentForm
            courseId={Number(courseId)}
            assignmentId={Number(assignmentId)}
            problems={problems}
            setProblems={setProblems}
            setIsLoading={setIsLoading}
            methods={methods}
          >
            <div className="flex w-[901px] flex-col gap-[28px]">
              <FormSection title="Title">
                <TitleForm
                  placeholder="Name your Assignment"
                  className="max-w-[760px]"
                />
              </FormSection>

              <div className="flex justify-between">
                <FormSection title="Week" className="w-[420px]">
                  {methods.getValues('week') && (
                    <WeekComboBox name="week" courseId={Number(courseId)} />
                  )}
                </FormSection>
                <FormSection
                  title="Due Time"
                  className="w-[420px]"
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
                <FormSection title="Start Time" className="w-[420px]">
                  {methods.getValues('startTime') && (
                    <TimeForm name="startTime" />
                  )}
                </FormSection>
                <FormSection
                  title="End Time"
                  className="w-[420px]"
                  isLabeled={false}
                >
                  {methods.getValues('endTime') && <TimeForm name="endTime" />}
                </FormSection>
              </div>

              <FormSection isFlexColumn title="Description" isLabeled={false}>
                {!isLoading && <DescriptionForm name="description" />}
              </FormSection>

              {/* NOTE: 최근 기획에서 해당기능을 없애기로 했는데, 혹시 revert할까봐 주석처리해놨어요 */}
              {/* <SwitchField
                name="autoFinalizeScore"
                title="Automatically Finalize Score"
                hasValue={methods.getValues('autoFinalizeScore') || false}
                tooltip={true}
              >
                <p className="text-xs font-normal text-black">
                  Automatically Finalize Score (No Manual Review)
                </p>
              </SwitchField> */}

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <AssignmentProblemListLabel />
                  <ImportProblemDialog
                    problems={problems}
                    setProblems={setProblems}
                  />
                </div>
                <AssignmentProblemTable
                  problems={problems}
                  setProblems={setProblems}
                  disableInput={false}
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
                  dueTime={
                    methods.getValues('dueTime') ?? methods.getValues('endTime')
                  }
                />
              </div>

              <div className="flex flex-col gap-1 rounded-md border bg-white p-[20px]">
                <SwitchField
                  name="isJudgeResultVisible"
                  title="Reveal Hidden Testcase Result"
                  description="When enabled, hidden testcase results will be revealed from students."
                  hasValue={methods.getValues('isJudgeResultVisible') || false}
                />

                <SwitchField
                  name="enableCopyPaste"
                  description="When enabled, students will be able to copy from or paste into the code editor."
                  title="Enable Participants Copy/Pasting"
                  hasValue={methods.getValues('enableCopyPaste') || false}
                />
              </div>

              <Button
                type="submit"
                className="flex h-[36px] w-full items-center gap-2 px-0"
                disabled={isLoading}
              >
                <IoIosCheckmarkCircle fontSize={20} />
                <div className="mb-[2px] text-base">Edit</div>
              </Button>
            </div>
          </EditAssignmentForm>
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
