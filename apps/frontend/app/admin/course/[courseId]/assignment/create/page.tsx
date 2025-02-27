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
        <main className="flex flex-col gap-6 px-20 py-16">
          <div className="flex items-center gap-4">
            <Link href={`/admin/course/${courseId}/assignment` as const}>
              <FaAngleLeft className="h-12" />
            </Link>
            <span className="text-4xl font-bold">Create Assignment</span>
          </div>

          <CreateAssignmentForm
            groupId={courseId}
            problems={problems}
            setIsCreating={setIsCreating}
          >
            <FormSection title="Title">
              <TitleForm placeholder="Name your Assignment" />
            </FormSection>

            <div className="flex gap-6">
              <FormSection title="Start Time">
                <TimeForm name="startTime" />
              </FormSection>
              <FormSection title="End Time">
                <TimeForm name="endTime" />
              </FormSection>
              <FormSection title="Week">
                <WeekComboBox name="week" />
              </FormSection>
            </div>

            <FormSection title="Description">
              <DescriptionForm name="description" />
            </FormSection>

            <SwitchField
              name="enableCopyPaste"
              title="Enable participants Copy/Pasting"
            />

            <SwitchField
              name="isJudgeResultVisible"
              title="Reveal scores to participants"
            />

            <SwitchField
              name="autoFinalizeScore"
              title="Automatic Grading"
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
              className="flex h-[36px] w-[100px] items-center gap-2 px-0"
              disabled={isCreating}
            >
              <IoMdCheckmarkCircleOutline fontSize={20} />
              <div className="mb-[2px] text-base">Create</div>
            </Button>
          </CreateAssignmentForm>
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
