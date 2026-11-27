'use client'

import {
  NoticeModal,
  NoticeModalTitle
} from '@/app/admin/course/[courseId]/(overview)/notice/_components/NoticeModal'
import { DialogDescription } from '@/components/shadcn/dialog'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { blueprintNoticeKeys } from '../_libs/noticeQueries'
import type {
  BlueprintNoticeEditData,
  BlueprintNoticeOptions,
  BlueprintNoticeSection
} from '../_libs/noticeTypes'
import type { BlueprintReadResult, BlueprintReadState } from '../_libs/types'
import { useBlueprintNoticeDataSource } from './BlueprintNoticeDataSourceProvider'
import {
  BlueprintNoticeForm,
  type BlueprintNoticeFormSeed
} from './BlueprintNoticeForm'
import { BlueprintReadBoundary } from './BlueprintReadBoundary'

interface Props {
  blueprintId: number
  noticeId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function identifier(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0
}

function completeOptions(value: unknown): value is BlueprintNoticeOptions {
  if (!record(value) || !Array.isArray(value.sections)) {
    return false
  }
  const sections: unknown[] = value.sections
  return (
    sections.every(
      (section) =>
        record(section) &&
        identifier(section.groupId) &&
        typeof section.sectionLabel === 'string' &&
        typeof section.title === 'string' &&
        (section.semester === null || typeof section.semester === 'string') &&
        (section.memberCount === null ||
          (Number.isSafeInteger(section.memberCount) &&
            Number(section.memberCount) >= 0))
    ) &&
    new Set(
      sections.map((section) => (section as BlueprintNoticeSection).groupId)
    ).size === sections.length
  )
}

function completeEdit(
  value: unknown,
  blueprintId: number,
  noticeId: number
): value is BlueprintNoticeEditData {
  if (
    !completeOptions(value) ||
    !record(value) ||
    value.blueprintCourseId !== blueprintId ||
    value.noticeId !== noticeId ||
    !record(value.values)
  ) {
    return false
  }
  const values = value.values
  return (
    typeof values.title === 'string' &&
    typeof values.content === 'string' &&
    Array.isArray(values.sectionGroupIds) &&
    values.sectionGroupIds.every(
      (groupId) =>
        identifier(groupId) &&
        value.sections.some((section) => section.groupId === groupId)
    ) &&
    new Set(values.sectionGroupIds).size === values.sectionGroupIds.length
  )
}

function EditorContent({
  blueprintId,
  noticeId,
  onCancel
}: Omit<Props, 'open' | 'onOpenChange'> & { onCancel: () => void }) {
  const source = useBlueprintNoticeDataSource()
  const query = useQuery<
    BlueprintReadResult<BlueprintNoticeOptions | BlueprintNoticeEditData>
  >({
    queryKey:
      noticeId === null
        ? blueprintNoticeKeys.options(blueprintId)
        : blueprintNoticeKeys.detail(blueprintId, noticeId),
    queryFn: () => {
      if (!source) {
        return Promise.reject(new Error('Notice read adapter is unavailable'))
      }
      return noticeId === null
        ? source.readOptions(blueprintId)
        : source.readNotice(blueprintId, noticeId)
    },
    enabled: source !== null,
    retry: false,
    refetchOnMount: 'always'
  })
  let state: BlueprintReadState<
    BlueprintNoticeOptions | BlueprintNoticeEditData
  > | null = null
  if (source) {
    if (query.isPending || query.fetchStatus !== 'idle') {
      state = { status: 'loading' }
    } else if (query.isError) {
      state = {
        status: 'error',
        onRetry: () => {
          void query.refetch()
        }
      }
    } else {
      state = query.data ?? { status: 'loading' }
    }
  }
  let current: BlueprintNoticeFormSeed | null = null
  if (state?.status === 'success') {
    if (noticeId === null && completeOptions(state.data)) {
      current = { mode: 'create', options: state.data }
    } else if (
      noticeId !== null &&
      completeEdit(state.data, blueprintId, noticeId)
    ) {
      current = {
        mode: 'edit',
        options: { sections: state.data.sections },
        initialValues: state.data.values
      }
    }
  }
  const [initial, setInitial] = useState<BlueprintNoticeFormSeed | null>(null)
  useEffect(() => {
    if (current) {
      setInitial((previous) => previous ?? current)
    }
  }, [current])
  const data = initial ?? current
  const raw = query.data?.status === 'success' ? query.data.data : null
  const scopeMismatch =
    noticeId !== null &&
    record(raw) &&
    (('blueprintCourseId' in raw && raw.blueprintCourseId !== blueprintId) ||
      ('noticeId' in raw && raw.noticeId !== noticeId))
  const denied =
    state === null ||
    query.data?.status === 'forbidden' ||
    query.data?.status === 'not-found' ||
    scopeMismatch
  const linkedChanged =
    current?.mode === 'edit' &&
    data?.mode === 'edit' &&
    (current.initialValues.sectionGroupIds.length !==
      data.initialValues.sectionGroupIds.length ||
      current.initialValues.sectionGroupIds.some(
        (groupId) => !data.initialValues.sectionGroupIds.includes(groupId)
      ))
  const ready = current !== null && !linkedChanged && !denied
  return (
    <>
      {state === null && (
        <p role="status">Blueprint Notice information is not connected.</p>
      )}
      {state !== null && state.status !== 'success' && (
        <BlueprintReadBoundary state={state}>
          {() => null}
        </BlueprintReadBoundary>
      )}
      {state?.status === 'success' && !current && (
        <p role="alert">
          Complete Notice information is unavailable. Existing values have not
          been replaced with defaults.
        </p>
      )}
      {scopeMismatch && (
        <p role="alert">
          This Notice does not belong to the current Blueprint.
        </p>
      )}
      {linkedChanged && (
        <p role="alert">
          Linked sections have changed. Reopen this Notice to load the current
          targets.
        </p>
      )}
      {data && (
        <div hidden={denied}>
          <BlueprintNoticeForm
            {...data}
            options={current?.options ?? data.options}
            ready={ready}
            onCancel={onCancel}
          />
        </div>
      )}
    </>
  )
}

export function BlueprintNoticeEditor({
  blueprintId,
  noticeId,
  open,
  onOpenChange
}: Props) {
  return (
    <NoticeModal
      open={open}
      onOpenChange={onOpenChange}
      className="w-[calc(100vw-32px)] max-w-[800px]"
    >
      <div className="flex min-w-0 flex-col gap-7 px-6 pb-[50px] pt-10 sm:px-10">
        <NoticeModalTitle className="text-head4_m_28 text-color-common-0 tracking-[-0.84px]">
          {noticeId === null ? 'Create Notice' : 'Edit Notice'}
        </NoticeModalTitle>
        <DialogDescription className="sr-only">
          Manage Notice content and its sections.
        </DialogDescription>
        {open && (
          <EditorContent
            key={`${blueprintId}:${noticeId ?? 'create'}`}
            blueprintId={blueprintId}
            noticeId={noticeId}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </div>
    </NoticeModal>
  )
}
