'use client'

import { Checkbox } from '@/components/shadcn/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import type { BlueprintNoticeSection } from '../_libs/noticeTypes'

interface Props {
  id: string
  editing: boolean
  sections: readonly BlueprintNoticeSection[]
  selectedGroupIds: readonly number[]
  onChange: (groupIds: readonly number[]) => void
  error?: string
}

export function BlueprintNoticeSections({
  id,
  editing,
  sections,
  selectedGroupIds,
  onChange,
  error
}: Props) {
  const selected = new Set(selectedGroupIds)
  const selectedCount = sections.filter((section) =>
    selected.has(section.groupId)
  ).length
  return (
    <section aria-labelledby={id} className="min-w-0">
      <h3 id={id} className="text-sub3_sb_16 mb-3">
        Sections
      </h3>
      {editing && (
        <p className="text-body2_m_14 mb-3 text-neutral-600">
          Linked sections are fixed and cannot be reselected.
        </p>
      )}
      {sections.length === 0 ? (
        <p role="status">
          {editing
            ? 'No sections are currently linked.'
            : 'No sections are available.'}
        </p>
      ) : (
        <Table
          aria-label={
            editing ? 'Linked Notice sections' : 'Available Notice sections'
          }
          className="min-w-[600px] table-fixed"
        >
          <TableHeader className="border-b-0">
            <TableRow>
              <TableHead className="w-20 p-0">
                <div className="text-body2_m_14 bg-color-neutral-99 flex h-[34px] items-center justify-center whitespace-nowrap rounded-full">
                  {editing ? (
                    'Linked'
                  ) : (
                    <Checkbox
                      aria-label="Select all Notice sections"
                      checked={
                        sections.length === selectedCount ||
                        (selectedCount > 0 && 'indeterminate')
                      }
                      onCheckedChange={(checked) =>
                        onChange(
                          checked
                            ? sections.map((section) => section.groupId)
                            : []
                        )
                      }
                    />
                  )}
                </div>
              </TableHead>
              {['Number', 'Title', 'Semester', 'Members'].map((title) => (
                <TableHead key={title} className="p-0 pl-1">
                  <div className="text-body2_m_14 bg-color-neutral-99 flex h-[34px] items-center justify-center rounded-full">
                    {title}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => (
              <TableRow key={section.groupId}>
                <TableCell className="text-body2_m_14 whitespace-nowrap px-3 text-center">
                  {editing ? (
                    'Linked'
                  ) : (
                    <Checkbox
                      aria-label={`Select Notice section ${section.sectionLabel}`}
                      checked={selected.has(section.groupId)}
                      onCheckedChange={(checked) =>
                        onChange(
                          checked
                            ? [...selectedGroupIds, section.groupId]
                            : selectedGroupIds.filter(
                                (groupId) => groupId !== section.groupId
                              )
                        )
                      }
                    />
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-primary bg-color-blue-90 text-sub4_sb_14 rounded-full px-2.5 py-1">
                    {section.sectionLabel}
                  </span>
                </TableCell>
                <TableCell className="text-body2_m_14 break-words">
                  {section.title}
                </TableCell>
                <TableCell className="text-body2_m_14 text-center">
                  {section.semester ?? '-'}
                </TableCell>
                <TableCell className="text-body2_m_14 text-center">
                  {section.memberCount ?? '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {error && (
        <p role="alert" className="text-error mt-2 text-sm">
          {error}
        </p>
      )}
    </section>
  )
}
