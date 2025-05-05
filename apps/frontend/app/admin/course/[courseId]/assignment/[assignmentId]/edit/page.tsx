'use client'

import { ConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import { DescriptionForm } from '@/app/admin/_components/DescriptionForm'
import { FormSection } from '@/app/admin/_components/FormSection'
import { SwitchField } from '@/app/admin/_components/SwitchField'
import { TimeForm } from '@/app/admin/_components/TimeForm'
import { TitleForm } from '@/app/admin/_components/TitleForm'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import type { UpdateAssignmentInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import type { Route } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { AssignmentProblemListLabel } from '../../_components/AssignmentProblemListLabel'
import { AssignmentProblemTable } from '../../_components/AssignmentProblemTable'
import { ImportDialog } from '../../_components/ImportDialog'
import { WeekComboBox } from '../../_components/WeekComboBox'
import { editSchema } from '../../_libs/schemas'
import type { AssignmentProblem } from '../../_libs/type'
import { EditAssignmentForm } from './_components/EditAssignmentForm'

export default function Page({
  params
}: {
  params: { courseId: string; assignmentId: string }
}) {
  const [problems, setProblems] = useState<AssignmentProblem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { courseId, assignmentId } = params

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
            <span className="text-4xl font-bold">Edit Assignment</span>
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
                  className="max-w-[767px]"
                />
              </FormSection>

              <FormSection
                title="Week"
                isJustifyBetween={false}
                className="gap-[67px]"
              >
                {methods.getValues('week') && (
                  <WeekComboBox name="week" courseId={Number(courseId)} />
                )}
              </FormSection>

              <div className="flex justify-between">
                <FormSection
                  title="Start Time"
                  isJustifyBetween={false}
                  className="gap-[27px]"
                >
                  {methods.getValues('startTime') && (
                    <TimeForm name="startTime" />
                  )}
                </FormSection>
                <FormSection
                  title="End Time"
                  isJustifyBetween={false}
                  className="gap-[71px]"
                  isLabeled={false}
                >
                  {methods.getValues('endTime') && <TimeForm name="endTime" />}
                </FormSection>
              </div>

              <FormSection isFlexColumn title="Description">
                {methods.getValues('description') && (
                  <DescriptionForm name="description" />
                )}
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
                  hasValue={methods.getValues('enableCopyPaste') || false}
                />

                <SwitchField
                  name="isJudgeResultVisible"
                  title="Reveal Hidden Testcase Result"
                  description="이걸 끄면 학생들이 Hidden 테케의 결과를 확인할 수 없어요"
                  hasValue={methods.getValues('isJudgeResultVisible') || false}
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
