'use client'

import { FormSection } from '@/app/admin/_components/FormSection'
import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { TextEditor } from '@/app/admin/_components/TextEditor'
import { Input } from '@/components/shadcn/input'
import { Switch } from '@/components/shadcn/switch'
import type { Dispatch, SetStateAction } from 'react'
import type {
  BlueprintCreateDraft,
  BlueprintCreateOptions
} from '../_libs/createTypes'
import type { BlueprintProblemCatalogController } from '../_libs/useBlueprintProblemCatalog'
import { BlueprintCreateProblems } from './BlueprintCreateProblems'

interface BlueprintCreateContentProps {
  draft: BlueprintCreateDraft
  onChange: Dispatch<SetStateAction<BlueprintCreateDraft>>
  options: BlueprintCreateOptions
  errors: Record<string, string>
  isExercise: boolean
  problemCatalog: BlueprintProblemCatalogController
  disabled: boolean
  problemChangesAllowed: boolean
}

const inputClass =
  'h-[46px] rounded-xl border-line data-[filled=true]:border-line px-4 text-body1_m_16'

export function BlueprintCreateContent({
  draft,
  onChange,
  options,
  errors,
  isExercise,
  problemCatalog,
  disabled,
  problemChangesAllowed
}: BlueprintCreateContentProps) {
  const kind = isExercise ? 'Exercise' : 'Assignment'
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
                onChange({ ...draft, title: event.currentTarget.value })
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
            <p id="blueprint-title-error" className="text-error text-sm">
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
            onChange={(value) => onChange({ ...draft, week: Number(value) })}
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
            Set Start, Due and End times for each selected section in Sections.
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
              errors.description ? 'blueprint-description-error' : undefined
            }
          >
            <TextEditor
              placeholder="Enter a description..."
              onChange={(description) =>
                onChange((current) => ({ ...current, description }))
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
        onChange={onChange}
        isExercise={isExercise}
        disabled={disabled}
        problemChangesAllowed={problemChangesAllowed}
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
                onChange({
                  ...draft,
                  [key]: !checked
                })
              }
            />
          </div>
        ))}
      </section>
    </div>
  )
}
