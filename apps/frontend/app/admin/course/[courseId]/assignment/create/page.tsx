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
import { useTranslate } from '@tolgee/react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { TimeFormPopover } from '../../../_components/TimeFormPopover'
import { AssignmentProblemListLabel } from '../../_components/AssignmentProblemListLabel'
import { AssignmentProblemTable } from '../../_components/AssignmentProblemTable'
import { AssignmentSolutionTable } from '../../_components/AssignmentSolutionTable'
import { CreateAssignmentForm } from '../../_components/CreateAssignmentForm'
import { ImportProblemDialog } from '../../_components/ImportProblemDialog'
import { WeekComboBox } from '../../_components/WeekComboBox'
import type { AssignmentProblem } from '../../_libs/type'

export default function Page() {
  const { courseId } = useParams()
  const [problems, setProblems] = useState<AssignmentProblem[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const { t } = useTranslate()

  return (
    <ConfirmNavigation>
      <ScrollArea className="w-full">
        <main className="flex flex-col gap-6 px-[93px] py-[80px]">
          <div className="flex items-center gap-4">
            <Link href={`/admin/course/${courseId}/assignment` as const}>
              <FaAngleLeft className="h-12" />
            </Link>
            <span className="text-[32px] font-bold">
              {t('create_assignment')}
            </span>
          </div>

          <CreateAssignmentForm
            groupId={courseId as string}
            problems={problems}
            setIsCreating={setIsCreating}
          >
            <div className="flex w-[901px] flex-col gap-[28px]">
              <FormSection title={t('title_section')}>
                <TitleForm
                  placeholder={t('assignment_name_placeholder')}
                  className="max-w-[760px]"
                />
              </FormSection>

              <div className="flex justify-between">
                <FormSection title={t('week_section')} className="w-[420px]">
                  <WeekComboBox name="week" courseId={Number(courseId)} />
                </FormSection>
                <FormSection
                  title={t('start_time_section')}
                  className="w-[420px]"
                >
                  <TimeForm name="startTime" />
                </FormSection>
              </div>
              <div className="flex justify-between">
                <FormSection
                  title={t('due_time_section')}
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

                <FormSection
                  title={t('end_time_section')}
                  className="w-[420px]"
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

              <FormSection
                isFlexColumn
                title={t('description_section')}
                isLabeled={false}
              >
                <DescriptionForm name="description" />
              </FormSection>

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
                  <Label required={false}>{t('solution_label')}</Label>
                  <p className="text-[11px] text-[#9B9B9B]">
                    {t('solution_description')}
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
                  title={t('reveal_hidden_testcase_result')}
                  description={t('hidden_testcase_description')}
                />

                <SwitchField
                  hasValue={true}
                  name="enableCopyPaste"
                  title={t('enable_copy_paste')}
                  description={t('copy_paste_description')}
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
                <div className="mb-[2px] text-base">{t('create_button')}</div>
              </Button>
            </div>
          </CreateAssignmentForm>
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
