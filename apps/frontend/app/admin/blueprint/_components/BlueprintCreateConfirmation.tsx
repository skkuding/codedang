'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import BulletIcon from '@/public/icons/blueprint-create-bullet.svg'
import LinkIcon from '@/public/icons/blueprint-create-link.svg'
import type {
  BlueprintCreateDraft,
  BlueprintCreateOptions
} from '../_libs/createTypes'

interface BlueprintCreateConfirmationProps {
  open: boolean
  draft: BlueprintCreateDraft
  options: BlueprintCreateOptions
  onConfirm: () => void
  onCancel: () => void
  onRestoreFocus: () => void
  mode?: 'create' | 'edit'
  initialDraft?: BlueprintCreateDraft
}

export function BlueprintCreateConfirmation({
  open,
  draft,
  options,
  onConfirm,
  onCancel,
  onRestoreFocus,
  mode = 'create',
  initialDraft
}: BlueprintCreateConfirmationProps) {
  const editing = mode === 'edit'
  const originalSections = new Map(
    initialDraft?.sections.map((section) => [section.groupId, section])
  )
  const scheduleFields = [
    ['startTime', 'Start Time'],
    ['dueTime', 'Due Time'],
    ['endTime', 'End Time']
  ] as const
  const changedSections = draft.sections.filter((section) =>
    scheduleFields.some(
      ([field]) =>
        originalSections.get(section.groupId)?.[field] !== section[field]
    )
  )
  const unchangedSections = draft.sections.filter(
    (section) => !changedSections.includes(section)
  )
  const contentChanges = initialDraft
    ? [
        ['Title', draft.title !== initialDraft.title],
        ['Week', draft.week !== initialDraft.week],
        ['Description', draft.description !== initialDraft.description],
        [
          'Options',
          draft.isJudgeResultVisible !== initialDraft.isJudgeResultVisible ||
            draft.enableCopyPaste !== initialDraft.enableCopyPaste
        ],
        [
          'Problem settings',
          draft.problems.length !== initialDraft.problems.length ||
            draft.problems.some((problem, index) => {
              const previous = initialDraft.problems[index]
              return (
                !previous ||
                problem.problemId !== previous.problemId ||
                problem.score !== previous.score ||
                problem.solution !== previous.solution ||
                (problem.solution === 'manual' &&
                  problem.manualReleaseTime !== previous.manualReleaseTime)
              )
            })
        ]
      ]
        .filter(([, changed]) => changed)
        .map(([label]) => label)
    : []
  const sectionLabel = (groupId: number) =>
    options.sections.find((section) => section.groupId === groupId)
      ?.sectionLabel ?? String(groupId)
  const displayTime = (time: string) => (time ? time.replace('T', ' ') : 'None')
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent
        hideCloseButton
        className="flex h-[580px] max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[600px] flex-col gap-4 overflow-y-auto rounded-2xl border-0 px-6 py-10 sm:rounded-2xl sm:px-10 sm:py-[50px]"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onRestoreFocus()
        }}
      >
        <DialogHeader className="shrink-0 items-center gap-7 space-y-0">
          <DialogTitle className="text-center text-[24px] font-semibold leading-[1.3] tracking-[-0.72px]">
            {editing
              ? '변경사항을 저장할까요?'
              : `${draft.sections.length}개 분반에 저장할까요?`}
          </DialogTitle>
          <DialogDescription
            className={`text-sub4_sb_14 flex w-full items-center gap-1.5 rounded-lg px-[18px] py-2 text-left ${editing ? 'bg-color-pink-95 text-error' : 'text-primary bg-[#EAF3FF]'}`}
          >
            <LinkIcon aria-hidden="true" className="shrink-0" />
            {editing
              ? `저장 시 연결된 ${draft.sections.length}개 분반에 즉시 반영됩니다. 실제 수정 API는 아직 연결되지 않았습니다.`
              : '선택한 분반과 일정을 확인하세요. 실제 생성 API는 아직 연결되지 않았습니다.'}
          </DialogDescription>
        </DialogHeader>
        <div className="h-[294px] min-h-0 overflow-y-auto rounded-[10px] bg-[#F5F5F5] p-5">
          {editing && initialDraft && (
            <div className="text-body2_m_14 flex flex-col gap-4">
              <p>
                {contentChanges.length
                  ? `변경 내용: ${contentChanges.join(', ')}`
                  : '콘텐츠 변경 없음'}
              </p>
              <section aria-label="Changed section schedules">
                <h3 className="mb-2 font-semibold">
                  일정이 변경된 분반 ({changedSections.length})
                </h3>
                {changedSections.map((section) => {
                  const previous = originalSections.get(section.groupId)
                  return (
                    <div
                      key={section.groupId}
                      className="border-line mb-2 rounded-lg border bg-white p-3"
                    >
                      <p>{sectionLabel(section.groupId)}</p>
                      {previous ? (
                        scheduleFields
                          .filter(
                            ([field]) => previous[field] !== section[field]
                          )
                          .map(([field, label]) => (
                            <p key={field}>
                              {label}: <del>{displayTime(previous[field])}</del>{' '}
                              → {displayTime(section[field])} (Asia/Seoul)
                            </p>
                          ))
                      ) : (
                        <p>Original schedule is unavailable.</p>
                      )}
                    </div>
                  )
                })}
              </section>
              <section aria-label="Unchanged section schedules">
                <h3 className="mb-2 font-semibold">
                  일정 변경 없는 분반 ({unchangedSections.length})
                </h3>
                <ul>
                  {unchangedSections.map((section) => (
                    <li key={section.groupId}>
                      {sectionLabel(section.groupId)}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
          {editing && !initialDraft && (
            <p role="alert">Original content is unavailable.</p>
          )}
          {!editing && (
            <ul className="flex flex-col gap-3">
              {draft.sections.map((section) => (
                <li
                  key={section.groupId}
                  className="text-body2_m_14 flex items-start gap-1 break-words"
                >
                  <BulletIcon aria-hidden="true" className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p>
                      {options.sections.find(
                        (item) => item.groupId === section.groupId
                      )?.sectionLabel ?? String(section.groupId)}
                    </p>
                    <p className="border-line mt-2 rounded-lg border bg-white px-3 py-2">
                      {section.startTime.replace('T', ' ')} →{' '}
                      {section.endTime.replace('T', ' ')} (Asia/Seoul)
                    </p>
                    <p className="mt-1">
                      Due:{' '}
                      {section.dueTime
                        ? section.dueTime.replace('T', ' ')
                        : 'None'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter className="mt-auto flex-row justify-center gap-2 sm:justify-center">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="h-[38px] rounded-lg px-4 text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="h-[38px] rounded-lg px-4 text-sm"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
