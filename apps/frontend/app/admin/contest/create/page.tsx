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
import { SwitchField } from '../../_components/SwitchField'
import { TitleForm } from '../../_components/TitleForm'
import { ContestProblemListLabel } from '../_components/ContestProblemListLabel'
import { ContestProblemTable } from '../_components/ContestProblemTable'
import { ImportDialog } from '../_components/ImportDialog'
import { TimeForm } from '../_components/TimeForm'
import type { ContestProblem } from '../_libs/schemas'
import CreateContestForm from './_components/CreateContestForm'

export default function Page() {
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [isCreating, setIsCreating] = useState(false)

  return (
    <ConfirmNavigation>
      <ScrollArea className="w-full">
        <main className="flex flex-col gap-6 px-20 py-16">
          <div className="flex items-center gap-4">
            <Link href="/admin/contest">
              <FaAngleLeft className="h-12" />
            </Link>
            <span className="text-4xl font-bold">Create Contest</span>
          </div>

          <CreateContestForm problems={problems} setIsCreating={setIsCreating}>
            <FormSection title="Title">
              <TitleForm placeholder="Name your contest" />
            </FormSection>

            <div className="flex gap-6">
              <FormSection title="Start Time">
                <TimeForm name="startTime" />
              </FormSection>
              <FormSection title="End Time">
                <TimeForm name="endTime" />
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
              name="invitationCode"
              title="Invitation Code"
              type="number"
              formElement="input"
              placeholder="Enter a invitation code"
            />

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <ContestProblemListLabel />
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
              className="flex h-[36px] w-[100px] items-center gap-2 px-0"
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
