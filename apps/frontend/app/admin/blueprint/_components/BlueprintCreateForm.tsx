'use client'

import { Button } from '@/components/shadcn/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/shadcn/tabs'
import { useRef, useState, type FormEvent } from 'react'
import {
  emptyBlueprintCreateDraft,
  type BlueprintCreateDraft,
  type BlueprintCreateOptions
} from '../_libs/createTypes'
import { validateBlueprintForm } from '../_libs/formValidation'
import type { BlueprintProblemCatalogController } from '../_libs/useBlueprintProblemCatalog'
import { BlueprintCreateConfirmation } from './BlueprintCreateConfirmation'
import { BlueprintCreateContent } from './BlueprintCreateContent'
import { BlueprintCreateSections } from './BlueprintCreateSections'

interface BlueprintFormProps {
  isExercise: boolean
  options: BlueprintCreateOptions
  onCancel: () => void
  optionsReady?: boolean
  problemCatalog: BlueprintProblemCatalogController
  problemChangesAllowed?: boolean
}

type BlueprintCreateFormProps = BlueprintFormProps &
  (
    | { mode?: 'create'; initialDraft?: never }
    | { mode: 'edit'; initialDraft: BlueprintCreateDraft }
  )

const tabClass =
  'text-sub3_sb_16 flex-1 rounded-none border-b-2 border-transparent pb-4 font-semibold tracking-[-0.48px] data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=inactive]:text-color-cool-neutral-40'

export function BlueprintCreateForm(props: BlueprintCreateFormProps) {
  const {
    isExercise,
    options,
    onCancel,
    optionsReady = true,
    problemCatalog,
    mode = 'create',
    problemChangesAllowed = false
  } = props
  const [originalDraft] = useState<BlueprintCreateDraft | null>(() =>
    props.mode === 'edit'
      ? {
          ...props.initialDraft,
          problems: props.initialDraft.problems.map((problem) => ({
            ...problem
          })),
          sections: props.initialDraft.sections.map((section) => ({
            ...section
          }))
        }
      : null
  )
  const [draft, setDraft] = useState<BlueprintCreateDraft>(
    () => originalDraft ?? emptyBlueprintCreateDraft()
  )
  const [tab, setTab] = useState('content')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmation, setConfirmation] = useState(false)
  const [connectionMessage, setConnectionMessage] = useState('')
  const handledConfirmation = useRef(false)
  const submittedDraft = useRef<BlueprintCreateDraft | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const createButtonRef = useRef<HTMLButtonElement>(null)
  const kind = isExercise ? 'Exercise' : 'Assignment'
  const editing = mode === 'edit'
  const canChangeProblems = !editing || problemChangesAllowed

  function validate(value: BlueprintCreateDraft) {
    const nextErrors = validateBlueprintForm(
      value,
      options,
      isExercise,
      problemCatalog,
      originalDraft,
      canChangeProblems
    )
    setErrors(nextErrors)
    setConnectionMessage('')
    if (Object.keys(nextErrors).length) {
      setTab(
        ['title', 'week', 'description', 'problems'].some(
          (key) => nextErrors[key]
        )
          ? 'content'
          : 'sections'
      )
      return false
    }
    return true
  }

  function review(event: FormEvent) {
    event.preventDefault()
    if (confirmation || !optionsReady || !validate(draft)) {
      return
    }
    handledConfirmation.current = false
    submittedDraft.current = {
      ...draft,
      title:
        editing && draft.title === originalDraft?.title
          ? draft.title
          : draft.title.trim()
    }
    setConfirmation(true)
  }

  function confirm() {
    if (handledConfirmation.current || !submittedDraft.current) {
      return
    }
    handledConfirmation.current = true
    setConfirmation(false)
    if (!optionsReady) {
      setConnectionMessage(
        editing
          ? 'Reload edit information before saving.'
          : 'Reload creation options before saving.'
      )
    } else if (validate(submittedDraft.current)) {
      setConnectionMessage(
        editing
          ? 'Blueprint updates are not connected. No content has been updated.'
          : 'Blueprint creation is not connected. No content has been created.'
      )
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={review}
      noValidate
      className="mt-10 flex w-full max-w-[1000px] flex-col gap-[60px]"
      aria-label={`${editing ? 'Edit' : 'Create'} Blueprint ${kind}`}
    >
      <fieldset disabled={confirmation} className="min-w-0 border-0 p-0">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList
            aria-label="Creation steps"
            className="border-line mb-10 flex h-auto w-full rounded-none border-0 border-b p-0"
          >
            <TabsTrigger value="content" className={tabClass}>
              {kind}
            </TabsTrigger>
            <TabsTrigger value="sections" className={tabClass}>
              Sections
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="content"
            forceMount
            hidden={tab !== 'content'}
            className="mt-0 data-[state=inactive]:hidden"
          >
            <BlueprintCreateContent
              draft={draft}
              onChange={setDraft}
              options={options}
              errors={errors}
              isExercise={isExercise}
              problemCatalog={problemCatalog}
              disabled={confirmation}
              problemChangesAllowed={canChangeProblems}
            />
          </TabsContent>
          <TabsContent
            value="sections"
            forceMount
            hidden={tab !== 'sections'}
            className="mt-0 data-[state=inactive]:hidden"
          >
            <BlueprintCreateSections
              options={options}
              draft={draft}
              onChange={setDraft}
              errors={errors}
              disabled={confirmation}
              selectionLocked={editing}
            />
          </TabsContent>
        </Tabs>
      </fieldset>

      {Object.keys(errors).length > 0 && (
        <p role="alert" className="text-error">
          Please check the highlighted content and section schedules.
        </p>
      )}
      {connectionMessage && (
        <p role="alert" className="text-error">
          {connectionMessage}
        </p>
      )}
      {!optionsReady && (
        <p role="status">
          {editing
            ? 'Reload edit information before saving.'
            : 'Reload creation options before saving.'}
        </p>
      )}
      <p role="status">
        {editing
          ? 'Saving is not connected. Content, section schedules and Solution changes cannot be saved yet.'
          : 'Saving is not connected. This form cannot create content yet.'}
      </p>
      <div className="flex flex-wrap justify-end gap-1">
        <Button
          type="button"
          variant="secondary"
          className="bg-color-neutral-95 text-color-neutral-60 hover:bg-color-neutral-90 h-[46px] rounded-[10px]"
          onClick={onCancel}
          disabled={confirmation}
        >
          Cancel
        </Button>
        <Button
          ref={createButtonRef}
          type="submit"
          className="h-[46px] rounded-[10px]"
          disabled={confirmation || !optionsReady}
        >
          {editing
            ? 'Review changes'
            : `Create in ${draft.sections.length} sections`}
        </Button>
      </div>
      <BlueprintCreateConfirmation
        open={confirmation}
        draft={submittedDraft.current ?? draft}
        options={options}
        mode={mode}
        initialDraft={originalDraft ?? undefined}
        onConfirm={confirm}
        onCancel={() => setConfirmation(false)}
        onRestoreFocus={() => {
          const candidate =
            formRef.current?.querySelector<HTMLElement>(
              '[aria-invalid="true"]'
            ) ?? createButtonRef.current
          const target = candidate?.matches(':disabled')
            ? formRef.current?.querySelector<HTMLElement>(
                '[role="tab"][data-state="active"]'
              )
            : candidate
          if (target?.isConnected) {
            target.focus()
          }
        }}
      />
    </form>
  )
}
