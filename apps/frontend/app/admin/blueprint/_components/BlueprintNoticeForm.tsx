'use client'

import { TextEditor } from '@/app/admin/_components/TextEditor'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { getNoticePlainText } from '../_libs/noticeText'
import type {
  BlueprintNoticeDraft,
  BlueprintNoticeOptions
} from '../_libs/noticeTypes'
import { validateBlueprintNoticeDraft } from '../_libs/noticeValidation'
import { BlueprintNoticeConfirmation } from './BlueprintNoticeConfirmation'
import { BlueprintNoticeSections } from './BlueprintNoticeSections'

export type BlueprintNoticeFormSeed =
  | { mode: 'create'; options: BlueprintNoticeOptions }
  | {
      mode: 'edit'
      options: BlueprintNoticeOptions
      initialValues: BlueprintNoticeDraft
    }

type Props = BlueprintNoticeFormSeed & {
  ready: boolean
  onCancel: () => void
}

export function BlueprintNoticeForm(props: Props) {
  const { options, ready, onCancel } = props
  const editing = props.mode === 'edit'
  const [original] = useState<BlueprintNoticeDraft>(() =>
    props.mode === 'edit'
      ? {
          ...props.initialValues,
          sectionGroupIds: [...props.initialValues.sectionGroupIds]
        }
      : { title: '', content: '', sectionGroupIds: [] }
  )
  const [values, setValues] = useState(original)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmation, setConfirmation] = useState(false)
  const [message, setMessage] = useState('')
  const submitted = useRef<BlueprintNoticeDraft | null>(null)
  const handled = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!ready) {
      setConfirmation(false)
      submitted.current = null
      handled.current = true
    }
  }, [ready])
  const id = useId()
  const plainText = getNoticePlainText(values.content)
  const rows = editing
    ? options.sections.filter((section) =>
        original.sectionGroupIds.includes(section.groupId)
      )
    : options.sections

  function validate(draft: BlueprintNoticeDraft) {
    const next = validateBlueprintNoticeDraft(
      draft,
      options,
      editing ? original : null
    )
    setErrors(next)
    setMessage('')
    return Object.keys(next).length === 0
  }

  function review(event: FormEvent) {
    event.preventDefault()
    const reviewed = {
      ...values,
      title:
        editing && values.title === original.title
          ? values.title
          : values.title.trim()
    }
    if (confirmation || !ready || !validate(reviewed)) {
      return
    }
    submitted.current = reviewed
    handled.current = false
    setConfirmation(true)
  }

  function confirm() {
    if (handled.current || !submitted.current) {
      return
    }
    handled.current = true
    setConfirmation(false)
    if (!ready) {
      setMessage('Reload Notice information before continuing.')
    } else if (validate(submitted.current)) {
      setMessage(
        `Blueprint Notice ${editing ? 'updates are' : 'creation is'} not connected. No notice has been ${editing ? 'updated' : 'created'}.`
      )
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={review}
      noValidate
      aria-label={`${editing ? 'Edit' : 'Create'} Blueprint Notice`}
      className="flex min-w-0 flex-col gap-7"
    >
      <fieldset
        disabled={confirmation || !ready}
        className="flex min-w-0 flex-col gap-4 border-0 p-0"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-title`} className="text-sub3_sb_16 shrink-0">
            Title <span className="text-error">*</span>
          </label>
          <div className="relative min-w-0 flex-1">
            <Input
              id={`${id}-title`}
              value={values.title}
              maxLength={35}
              onChange={(event) =>
                setValues({ ...values, title: event.currentTarget.value })
              }
              placeholder="Enter the Title"
              isError={Boolean(errors.title)}
              aria-describedby={errors.title ? `${id}-title-error` : undefined}
              className="text-body1_m_16 border-line h-[46px] rounded-xl px-4 pr-20"
            />
            <span className="text-caption1_m_13 text-color-cool-neutral-50 absolute right-4 top-3">
              {values.title.length}/35
            </span>
          </div>
        </div>
        {errors.title && (
          <p
            id={`${id}-title-error`}
            role="alert"
            className="text-error text-sm"
          >
            {errors.title}
          </p>
        )}
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor={`${id}-content`} className="text-sub3_sb_16">
            Main Text <span className="text-error">*</span>
          </label>
          <div
            id={`${id}-content`}
            role="group"
            aria-label="Main Text"
            aria-describedby={
              errors.content ? `${id}-content-error` : undefined
            }
            inert={confirmation || !ready}
            className="relative min-w-0 [&>div]:rounded-xl [&_.ProseMirror]:h-[208px] [&_.ProseMirror]:[overflow-wrap:anywhere]"
          >
            <TextEditor
              placeholder="Enter the Main Text"
              defaultValue={values.content}
              onChange={(content) =>
                setValues((current) => ({ ...current, content }))
              }
            />
            <span className="text-caption1_m_13 text-color-cool-neutral-60 absolute bottom-6 right-6">
              {plainText.length}/400
            </span>
          </div>
          {errors.content && (
            <p
              id={`${id}-content-error`}
              role="alert"
              className="text-error text-sm"
            >
              {errors.content}
            </p>
          )}
        </div>
        <BlueprintNoticeSections
          id={`${id}-sections`}
          editing={editing}
          sections={rows}
          selectedGroupIds={values.sectionGroupIds}
          onChange={(sectionGroupIds) =>
            setValues({ ...values, sectionGroupIds })
          }
          error={errors.sections}
        />
      </fieldset>
      {!ready && (
        <p role="status">Reload Notice information before continuing.</p>
      )}
      {errors.unchanged && <p role="alert">{errors.unchanged}</p>}
      <p role="status" className="text-body2_m_14">
        Notice saving is not connected.
      </p>
      {message && <p role="alert">{message}</p>}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-primary text-primary text-sub2_m_18 rounded-full px-6"
          disabled={confirmation}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          ref={submitRef}
          type="submit"
          className="text-sub2_m_18 rounded-full px-6"
          disabled={confirmation || !ready}
        >
          {editing ? 'Update' : 'Create'}
        </Button>
      </div>
      <BlueprintNoticeConfirmation
        open={confirmation}
        editing={editing}
        values={submitted.current ?? values}
        original={original}
        sections={options.sections}
        onCancel={() => setConfirmation(false)}
        onConfirm={confirm}
        onRestoreFocus={() => {
          const candidate =
            formRef.current?.querySelector<HTMLElement>(
              `input[aria-invalid="true"], [aria-describedby="${id}-content-error"] [contenteditable="true"]`
            ) ?? submitRef.current
          const target =
            (candidate?.matches(':disabled')
              ? formRef.current?.querySelector<HTMLElement>(
                  'input:not(:disabled)'
                )
              : candidate) ??
            formRef.current
              ?.closest('[role="dialog"]')
              ?.querySelector<HTMLElement>('button[aria-label="Close"]')
          if (target?.isConnected) {
            target.focus()
          }
        }}
      />
    </form>
  )
}
