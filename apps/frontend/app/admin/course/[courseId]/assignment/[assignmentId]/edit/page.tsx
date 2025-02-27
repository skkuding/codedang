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
        <main className="flex flex-col gap-6 px-20 py-16">
          <div className="flex items-center gap-4">
            <Link href={`/admin/course/${courseId}/assignment`}>
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
            <FormSection title="Title">
              <TitleForm placeholder="Name your assignment" />
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

              <FormSection title="Week">
                {methods.getValues('week') && <WeekComboBox name="week" />}
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
              name="autoFinalizeScore"
              title="Automatic Grading"
              hasValue={methods.getValues('autoFinalizeScore') || false}
              tooltip={true}
            >
              <p className="text-xs font-normal text-black">
                Automatic Grading is Awesome!
              </p>
            </SwitchField>

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

            <Button
              type="submit"
              className="flex h-[36px] w-[90px] items-center gap-2 px-0"
              disabled={isLoading}
            >
              <IoIosCheckmarkCircle fontSize={20} />
              <div className="text-base">Edit</div>
            </Button>
          </EditAssignmentForm>
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
