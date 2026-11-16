'use client'

import { Checkbox } from '@/components/shadcn/checkbox'
import { Input } from '@/components/shadcn/input'
import { Switch } from '@/components/shadcn/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { useId, useState } from 'react'
import type {
  BlueprintCreateDraft,
  BlueprintCreateOptions,
  BlueprintSectionSchedule
} from '../_libs/createTypes'
import { applyBlueprintScheduleToSelected } from '../_libs/createValidation'

interface BlueprintCreateSectionsProps {
  options: BlueprintCreateOptions
  draft: BlueprintCreateDraft
  onChange: (draft: BlueprintCreateDraft) => void
  errors: Readonly<Record<string, string>>
  disabled?: boolean
}

const scheduleFields = [
  { name: 'startTime', label: 'Start Time', required: true },
  { name: 'dueTime', label: 'Due Time', required: false },
  { name: 'endTime', label: 'End Time', required: true }
] as const

type ScheduleField = (typeof scheduleFields)[number]['name']

function emptySchedule(groupId: number): BlueprintSectionSchedule {
  return { groupId, startTime: '', dueTime: '', endTime: '' }
}

export function BlueprintCreateSections({
  options,
  draft,
  onChange,
  errors,
  disabled = false
}: BlueprintCreateSectionsProps) {
  const id = useId()
  const [applyToSelected, setApplyToSelected] = useState({
    startTime: false,
    dueTime: false,
    endTime: false
  })
  const selectedIds = new Set(draft.sections.map(({ groupId }) => groupId))
  const selectedSections = options.sections.filter(({ groupId }) =>
    selectedIds.has(groupId)
  )
  const allSelected =
    options.sections.length > 0 &&
    selectedSections.length === options.sections.length

  function selectSection(groupId: number, selected: boolean) {
    const sections = selected
      ? [...draft.sections, emptySchedule(groupId)]
      : draft.sections.filter((section) => section.groupId !== groupId)
    onChange({ ...draft, sections })
  }

  function updateSchedule(
    groupId: number,
    field: ScheduleField,
    value: string
  ) {
    onChange(
      applyToSelected[field]
        ? applyBlueprintScheduleToSelected(draft, field, value)
        : {
            ...draft,
            sections: draft.sections.map((section) =>
              section.groupId === groupId
                ? { ...section, [field]: value }
                : section
            )
          }
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-[60px]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <label
          htmlFor={`${id}-course`}
          className="text-sub2_m_18 w-[105px] shrink-0 tracking-[-0.54px]"
        >
          Course
        </label>
        <Input
          id={`${id}-course`}
          value={options.courseTitle}
          readOnly
          sizeVariant="lg"
          className="border-line data-[filled=true]:border-line text-body1_m_16 rounded-xl px-4"
        />
      </div>

      <section aria-labelledby={`${id}-sections-heading`} className="min-w-0">
        <div className="mb-5 flex flex-col gap-0.5">
          <h2
            id={`${id}-sections-heading`}
            className="text-sub2_m_18 tracking-[-0.54px]"
          >
            Sections <span className="text-error">*</span>
          </h2>
          <p className="text-body2_m_14 text-color-neutral-70 tracking-[-0.42px]">
            Select the sections that will receive this content.
          </p>
        </div>
        {options.sections.length === 0 ? (
          <p role="status">No sections are available for this Blueprint.</p>
        ) : (
          <Table
            aria-label="Available sections"
            className="min-w-[760px] table-fixed"
          >
            <colgroup>
              <col className="w-[9%]" />
              <col className="w-[14%]" />
              <col className="w-[53%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
            </colgroup>
            <TableHeader className="border-b-0">
              <TableRow>
                <TableHead scope="col" className="p-0 pr-1">
                  <div className="bg-color-neutral-99 flex h-[39px] items-center justify-center gap-1 rounded-full">
                    <Checkbox
                      aria-label="Select all sections"
                      disabled={disabled}
                      checked={
                        allSelected ||
                        (selectedSections.length > 0 && 'indeterminate')
                      }
                      onCheckedChange={(checked) => {
                        const byId = new Map(
                          draft.sections.map((section) => [
                            section.groupId,
                            section
                          ])
                        )
                        onChange({
                          ...draft,
                          sections: checked
                            ? options.sections.map(
                                ({ groupId }) =>
                                  byId.get(groupId) ?? emptySchedule(groupId)
                              )
                            : []
                        })
                      }}
                    />
                    <span className="text-body2_m_14 tracking-[-0.42px]">
                      {selectedSections.length}/{options.sections.length}
                    </span>
                  </div>
                </TableHead>
                {['Number', 'Title', 'Semester', 'Members'].map(
                  (label, index) => (
                    <TableHead
                      key={label}
                      scope="col"
                      className={index === 3 ? 'p-0' : 'p-0 pr-1'}
                    >
                      <div className="bg-color-neutral-99 text-body2_m_14 text-color-neutral-60 flex h-[39px] items-center justify-center rounded-full px-2 tracking-[-0.42px]">
                        {label}
                      </div>
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {options.sections.map((section) => (
                <TableRow key={section.groupId}>
                  <TableCell className="h-[58px] p-4 text-center md:p-4">
                    <Checkbox
                      aria-label={`Select section ${section.sectionLabel}`}
                      disabled={disabled}
                      checked={selectedIds.has(section.groupId)}
                      onCheckedChange={(checked) =>
                        selectSection(section.groupId, checked === true)
                      }
                    />
                  </TableCell>
                  <TableCell className="p-2 text-center md:p-2">
                    <span className="bg-color-blue-90 text-primary text-sub4_sb_14 inline-block whitespace-nowrap rounded-full px-2.5 py-1 tracking-[-0.42px]">
                      {section.sectionLabel}
                    </span>
                  </TableCell>
                  <TableCell className="text-body2_m_14 break-words p-4 tracking-[-0.42px] md:p-4">
                    {section.title}
                  </TableCell>
                  <TableCell className="text-body2_m_14 p-2 text-center tracking-[-0.42px] md:p-2">
                    {section.semester ?? '-'}
                  </TableCell>
                  <TableCell className="p-2 text-center md:p-2">
                    <span className="border-line text-body2_m_14 inline-block min-w-[70px] rounded-full border px-5 py-1.5 tracking-[-0.42px]">
                      {section.memberCount ?? '-'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {errors.sections && (
          <p role="alert" className="text-error mt-2 text-sm">
            {errors.sections}
          </p>
        )}
      </section>

      <section aria-labelledby={`${id}-schedule-heading`} className="min-w-0">
        <div className="mb-5 flex flex-col gap-0.5">
          <h2
            id={`${id}-schedule-heading`}
            className="text-sub2_m_18 tracking-[-0.54px]"
          >
            Section Schedule <span className="text-error">*</span>
          </h2>
          <p className="text-body2_m_14 text-color-neutral-70 tracking-[-0.42px]">
            Set each section&apos;s times in Asia/Seoul. Due Time is optional.
          </p>
          <p className="text-body2_m_14 text-color-neutral-70 tracking-[-0.42px]">
            Apply to selected sections copies subsequent changes to that time.
          </p>
        </div>
        {selectedSections.length === 0 ? (
          <p role="status">Select sections to enter their schedules.</p>
        ) : (
          <Table
            aria-label="Section schedules"
            className="min-w-[1000px] table-fixed"
          >
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[25.33%]" />
              <col className="w-[25.33%]" />
              <col className="w-[25.34%]" />
            </colgroup>
            <TableHeader className="border-b-0">
              <TableRow>
                <TableHead scope="col" className="p-0 pr-4">
                  <div className="bg-color-neutral-99 text-body2_m_14 text-color-neutral-60 flex h-[39px] items-center justify-center rounded-full tracking-[-0.42px]">
                    Number
                  </div>
                </TableHead>
                <TableHead colSpan={3} scope="colgroup" className="p-0">
                  <div className="bg-color-neutral-99 text-body2_m_14 text-color-neutral-60 flex h-[39px] items-center rounded-full tracking-[-0.42px]">
                    {scheduleFields.map(({ name, label }) => (
                      <span
                        key={name}
                        className="border-line flex-1 border-l first:border-l-0"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead scope="row" className="p-0">
                  <span className="sr-only">
                    Apply times to selected sections
                  </span>
                </TableHead>
                {scheduleFields.map(({ name, label }) => (
                  <TableHead key={name} className="py-4">
                    <label className="text-body2_m_14 text-color-neutral-60 flex items-center justify-center gap-2 whitespace-nowrap tracking-[-0.42px]">
                      Apply to selected sections
                      <Switch
                        aria-label={`Apply ${label} to selected sections`}
                        checked={applyToSelected[name]}
                        disabled={disabled}
                        onCheckedChange={(checked) =>
                          setApplyToSelected((current) => ({
                            ...current,
                            [name]: checked
                          }))
                        }
                        className="w-10"
                        thumbClassName="data-[state=checked]:translate-x-5"
                      />
                    </label>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedSections.map((section) => {
                const schedule = draft.sections.find(
                  ({ groupId }) => groupId === section.groupId
                )
                if (!schedule) {
                  return null
                }
                return (
                  <TableRow key={section.groupId}>
                    <TableCell className="h-20 p-3 md:p-3">
                      <div className="flex items-center gap-2.5">
                        <span className="bg-color-blue-90 text-primary text-sub4_sb_14 shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 tracking-[-0.42px]">
                          {section.sectionLabel}
                        </span>
                        <span className="text-body2_m_14 min-w-0 break-words tracking-[-0.42px]">
                          {section.title}
                        </span>
                      </div>
                    </TableCell>
                    {scheduleFields.map(({ name, label, required }) => {
                      const fieldId = `${id}-${section.groupId}-${name}`
                      const error =
                        errors[`sections.${section.groupId}.${name}`]
                      return (
                        <TableCell key={name} className="p-2 md:p-2">
                          <label htmlFor={fieldId} className="sr-only">
                            {label} for {section.sectionLabel}
                          </label>
                          <Input
                            id={fieldId}
                            type="datetime-local"
                            step={60}
                            value={schedule[name]}
                            disabled={disabled}
                            required={required}
                            isError={Boolean(error)}
                            aria-describedby={
                              error ? `${fieldId}-error` : undefined
                            }
                            onChange={(event) =>
                              updateSchedule(
                                section.groupId,
                                name,
                                event.currentTarget.value
                              )
                            }
                            className={`text-body1_m_16 h-[38px] min-w-0 rounded-[10px] px-[14px] tracking-[-0.48px] ${error ? 'border-red-500 data-[filled=true]:border-red-500' : 'border-line data-[filled=true]:border-line'}`}
                          />
                          {error && (
                            <p
                              id={`${fieldId}-error`}
                              role="alert"
                              className="text-error mt-1 text-xs"
                            >
                              {error}
                            </p>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
