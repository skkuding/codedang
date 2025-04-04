'use client'

import { ConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import { DescriptionForm } from '@/app/admin/_components/DescriptionForm'
import { FormSection } from '@/app/admin/_components/FormSection'
import { SwitchField } from '@/app/admin/_components/SwitchField'
import { TimeForm } from '@/app/admin/_components/TimeForm'
import { TitleForm } from '@/app/admin/_components/TitleForm'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import type { Route } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { AssignmentProblemListLabel } from '../_components/AssignmentProblemListLabel'
import { AssignmentProblemTable } from '../_components/AssignmentProblemTable'
import { ImportDialog } from '../_components/ImportDialog'
import { WeekComboBox } from '../_components/WeekComboBox'
import type { AssignmentProblem } from '../_libs/type'
import { CreateAssignmentForm } from './_components/CreateAssignmentForm'

export default function Page({ params }: { params: { courseId: string } }) {
  const { courseId } = params
  const [problems, setProblems] = useState<AssignmentProblem[]>([])
  const [isCreating, setIsCreating] = useState(false)

  return (
    <ConfirmNavigation>
      <ScrollArea className="w-full">
        <main className="flex flex-col gap-6 px-[93px] py-[80px]">
          <div className="flex items-center gap-4">
            <Link href={`/admin/course/${courseId}/assignment` as Route}>
              <FaAngleLeft className="h-12" />
            </Link>
            <span className="text-[32px] font-bold">CREATE ASSIGNMENT</span>
          </div>

          <CreateAssignmentForm
            groupId={courseId}
            problems={problems}
            setIsCreating={setIsCreating}
          >
            <FormSection
              isFlexColumn={false}
              title="Title"
              className="gap-[77px]"
            >
              <TitleForm placeholder="Name your Assignment" />
            </FormSection>

            <div className="flex flex-col gap-6">
              <FormSection
                title="Week"
                isJustifyBetween={false}
                className="gap-[67px]"
              >
                <WeekComboBox name="week" courseId={Number(courseId)} />
              </FormSection>
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

              <FormSection isFlexColumn title="Description">
                <DescriptionForm name="description" />
              </FormSection>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <AssignmentProblemListLabel />
                  <ImportDialog problems={problems} setProblems={setProblems} />
                </div>
                <AssignmentProblemTable
                  problems={problems}
                  setProblems={setProblems}
                  disableInput={false}
                />
              </div>

              <div className="flex flex-col gap-1 rounded-md border bg-white p-[20px]">
                <SwitchField
                  name="enableCopyPaste"
                  title="Enable Participants Copy/Pasting"
                />

                <SwitchField
                  name="isJudgeResultVisible"
                  title="Reveal Hidden Testcase Result"
                  description="이걸 끄면 학생들이 Hidden 테케의 결과를 확인할 수 없어요"
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
