'use client'

import { FormSection } from '@/app/admin/_components/FormSection'
import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { TextEditor } from '@/app/admin/_components/TextEditor'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { Switch } from '@/components/shadcn/switch'
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
import { validateBlueprintCreateDraft } from '../_libs/createValidation'
import type { BlueprintProblemCatalogController } from '../_libs/useBlueprintProblemCatalog'
import { BlueprintCreateConfirmation } from './BlueprintCreateConfirmation'
import { BlueprintCreateProblems } from './BlueprintCreateProblems'
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

const inputClass =
  'h-[46px] rounded-xl border-line data-[filled=true]:border-line px-4 text-body1_m_16'
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
    const nextErrors = validateBlueprintCreateDraft(
      value,
      options,
      isExercise,
      problemCatalog.problems
    )
    if (
      originalDraft &&
      !canChangeProblems &&
      (value.problems.length !== originalDraft.problems.length ||
        value.problems.some(
          (problem) =>
            originalDraft.problems.find(
              (original) => original.problemId === problem.problemId
            )?.score !== problem.score
        ))
    ) {
      nextErrors.problems =
        'Problem selection and scores cannot change without permission.'
    }
    if (originalDraft) {
      if (
        value.sections.length !== originalDraft.sections.length ||
        value.sections.some(
          (section) =>
            !originalDraft.sections.some(
              (original) => original.groupId === section.groupId
            )
        )
      ) {
        nextErrors.sections = 'Linked sections cannot change during editing.'
      } else if (originalDraft.sections.length === 0) {
        delete nextErrors.sections
      }
    }
    if (
      value.problems.length > 0 &&
      (problemCatalog.status !== 'ready' || problemCatalog.isLoadingMore)
    ) {
      nextErrors.problems =
        'Reload problem information before saving selected problems.'
    }
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

  const flags = [
    {
      key: 'isJudgeResultVisible',
      label: 'Hide Hidden Testcase Result',
      description:
        'When enabled, hidden testcase results will be hidden from students.'
    },
    {
      key: 'enableCopyPaste',
      label: 'Disable Copy/Paste',
      description:
        'When enabled, students will not be able to copy from or paste into the code editor.'
    }
  ] as const

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
            <div className="flex min-w-0 flex-col gap-[60px]">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="blueprint-create-course"
                    className="text-sub3_sb_16 tracking-[-0.48px]"
                  >
                    Course
                  </label>
                  <Input
                    id="blueprint-create-course"
                    value={options.courseTitle}
                    readOnly
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="blueprint-create-title"
                    className="text-sub3_sb_16 tracking-[-0.48px]"
                  >
                    Title <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="blueprint-create-title"
                      value={draft.title}
                      maxLength={120}
                      onChange={(event) =>
                        setDraft({ ...draft, title: event.currentTarget.value })
                      }
                      className={`${inputClass} pr-20 ${errors.title ? 'border-red-500 data-[filled=true]:border-red-500' : ''}`}
                      placeholder={`Name your ${kind}`}
                      isError={Boolean(errors.title)}
                      aria-describedby={
                        errors.title ? 'blueprint-title-error' : undefined
                      }
                    />
                    <span className="text-color-cool-neutral-50 absolute right-4 top-3 text-[13px] tracking-[-0.39px]">
                      {draft.title.length}/120
                    </span>
                  </div>
                  {errors.title && (
                    <p
                      id="blueprint-title-error"
                      className="text-error text-sm"
                    >
                      {errors.title}
                    </p>
                  )}
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-[calc(50%-4px)]">
                  <label
                    htmlFor="blueprint-create-week"
                    className="text-sub3_sb_16 tracking-[-0.48px]"
                  >
                    Week <span className="text-error">*</span>
                  </label>
                  <OptionSelect
                    value={draft.week === null ? '' : String(draft.week)}
                    onChange={(value) =>
                      setDraft({ ...draft, week: Number(value) })
                    }
                    disabled={!options.weeks.length}
                    options={options.weeks.map(String)}
                    placeholder="Select an Option"
                    className={`${inputClass} ${errors.week ? 'border-red-500' : ''}`}
                    triggerProps={{
                      id: 'blueprint-create-week',
                      'aria-invalid': Boolean(errors.week),
                      'aria-describedby': errors.week
                        ? 'blueprint-week-error'
                        : undefined
                    }}
                  />
                  {errors.week && (
                    <p id="blueprint-week-error" className="text-error text-sm">
                      {errors.week}
                    </p>
                  )}
                  <p className="text-body2_m_14 text-color-neutral-60">
                    Set Start, Due and End times for each selected section in
                    Sections.
                  </p>
                </div>
              </div>

              <div className="min-w-0 [&_.ProseMirror]:min-h-[157px] [&_.ProseMirror]:max-w-full [&_.ProseMirror]:[overflow-wrap:anywhere]">
                <FormSection
                  title="Description"
                  isLabeled={false}
                  isFlexColumn
                  className="[&>div:first-child]:text-sub2_m_18 gap-2 [&>div:first-child]:tracking-[-0.54px]"
                >
                  <div
                    className="min-w-0"
                    role="group"
                    aria-label="Description"
                    aria-describedby={
                      errors.description
                        ? 'blueprint-description-error'
                        : undefined
                    }
                  >
                    <TextEditor
                      placeholder="Enter a description..."
                      onChange={(description) =>
                        setDraft((current) => ({ ...current, description }))
                      }
                      defaultValue={draft.description}
                    />
                    {errors.description && (
                      <p
                        id="blueprint-description-error"
                        className="text-error mt-1 text-sm"
                      >
                        {errors.description}
                      </p>
                    )}
                  </div>
                </FormSection>
              </div>

              <BlueprintCreateProblems
                problemCatalog={problemCatalog}
                draft={draft}
                onChange={setDraft}
                isExercise={isExercise}
                disabled={confirmation}
                problemChangesAllowed={canChangeProblems}
                errors={errors}
              />

              <section aria-label="Options" className="flex flex-col gap-2">
                <h2 className="text-sub2_m_18 tracking-[-0.54px]">Option</h2>
                {flags.map(({ key, label, description }) => (
                  <div
                    key={key}
                    className="border-line flex items-center justify-between gap-4 rounded-xl border px-[30px] py-4"
                  >
                    <div className="min-w-0">
                      <label
                        htmlFor={`blueprint-${key}`}
                        className="text-sub2_m_18 tracking-[-0.54px]"
                      >
                        {label}
                      </label>
                      <p className="text-body2_m_14 text-color-neutral-70 mt-1 tracking-[-0.42px]">
                        {description}
                      </p>
                    </div>
                    <Switch
                      id={`blueprint-${key}`}
                      className="h-[30px] w-[60px]"
                      thumbClassName="size-[26px] data-[state=checked]:translate-x-[30px]"
                      checked={!draft[key]}
                      onCheckedChange={(checked) =>
                        setDraft({
                          ...draft,
                          [key]: !checked
                        })
                      }
                    />
                  </div>
                ))}
              </section>
            </div>
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
