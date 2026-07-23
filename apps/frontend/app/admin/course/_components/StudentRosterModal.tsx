'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { IoClose } from 'react-icons/io5'

export interface RosterRow {
  studentId: string
  name: string
}

const emptyRow = (): RosterRow => ({ studentId: '', name: '' })
const INITIAL_ROW_COUNT = 5

interface StudentRosterModalProps {
  rows: RosterRow[]
  onSave: (rows: RosterRow[]) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Parses clipboard text pasted from Excel/Sheets (tab/newline-delimited)
 *  and fills rows starting at the pasted-into cell. */
function applyPaste(
  rows: RosterRow[],
  text: string,
  rowIndex: number,
  col: keyof RosterRow
): RosterRow[] {
  const lines = text
    .split(/\r\n|\n|\r/)
    .filter((line, i, arr) => !(i === arr.length - 1 && line === ''))
  const columns: (keyof RosterRow)[] = ['studentId', 'name']
  const startColIndex = columns.indexOf(col)

  const next = [...rows]
  lines.forEach((line, i) => {
    const r = rowIndex + i
    while (next.length <= r) {
      next.push(emptyRow())
    }
    const cells = line.split('\t')
    cells.forEach((cell, c) => {
      const targetCol = columns[startColIndex + c]
      if (targetCol) {
        next[r] = { ...next[r], [targetCol]: cell.trim() }
      }
    })
  })
  return next
}

export function StudentRosterModal({
  rows,
  onSave,
  open,
  onOpenChange
}: StudentRosterModalProps) {
  const [draft, setDraft] = useState<RosterRow[]>(rows)

  useEffect(() => {
    if (open) {
      setDraft(
        rows.length > 0
          ? rows
          : Array.from({ length: INITIAL_ROW_COUNT }, emptyRow)
      )
    }
  }, [open, rows])

  const updateCell = (
    rowIndex: number,
    col: keyof RosterRow,
    value: string
  ) => {
    setDraft((prev) =>
      prev.map((row, i) => (i === rowIndex ? { ...row, [col]: value } : row))
    )
  }

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    rowIndex: number,
    col: keyof RosterRow
  ) => {
    const text = e.clipboardData.getData('text')
    if (!text.includes('\t') && !text.includes('\n')) {
      return
    }
    e.preventDefault()
    setDraft((prev) => applyPaste(prev, text, rowIndex, col))
  }

  const addRow = () => setDraft((prev) => [...prev, emptyRow()])
  const addRows = (count: number) =>
    setDraft((prev) => [
      ...prev,
      ...Array.from({ length: count }, () => emptyRow())
    ])
  const removeRow = (rowIndex: number) =>
    setDraft((prev) => prev.filter((_, i) => i !== rowIndex))
  const clearAll = () =>
    setDraft(Array.from({ length: INITIAL_ROW_COUNT }, emptyRow))

  const nonEmptyCount = draft.filter((row) => row.studentId.trim()).length

  return (
    <Modal
      size="lg"
      type="custom"
      title="Student Roster"
      headerDescription="Copy the Student ID column (and Name) from your portal and paste it into any cell — all rows fill at once. You can also type entries manually."
      open={open}
      onOpenChange={onOpenChange}
      className="h-auto! max-h-[calc(100vh-120px)]!"
      primaryButton={{
        text: 'Save roster',
        onClick: () => {
          onSave(draft.filter((row) => row.studentId.trim()))
          onOpenChange(false)
        }
      }}
      secondaryButton={{
        text: 'Cancel',
        variant: 'outline',
        onClick: () => onOpenChange(false)
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{nonEmptyCount} students</span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={addRow}>
              + Add row
            </Button>
            <Button type="button" variant="outline" onClick={() => addRows(10)}>
              + 10 rows
            </Button>
            <Button type="button" variant="outline" onClick={clearAll}>
              Clear all
            </Button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-460px)] overflow-y-auto rounded-[14px] border border-[#e2e2e7]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-[#f6f6f8]">
              <tr>
                <th className="h-12 w-[52px] border-r border-[#e8e8ee] px-3 text-center align-middle text-[13px] font-semibold text-[#b4b4bc]">
                  #
                </th>
                <th className="h-12 border-r border-[#e8e8ee] px-5 text-left align-middle text-[15px] font-semibold text-[#3f3f46]">
                  Student ID
                </th>
                <th className="h-12 border-r border-[#e8e8ee] px-5 text-left align-middle text-[15px] font-semibold text-[#3f3f46]">
                  Name
                </th>
                <th className="h-12 w-[44px] align-middle" />
              </tr>
            </thead>
            <tbody>
              {draft.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-[#eeeef1]">
                  <td className="h-12 border-r border-[#eeeef1] bg-[#fafafb] px-3 text-center align-middle text-[13px] tabular-nums text-[#b4b4bc]">
                    {rowIndex + 1}
                  </td>
                  <td className="h-12 border-r border-[#eeeef1] px-1 align-middle">
                    <input
                      className="w-full rounded-sm border-none bg-transparent px-2 py-1 text-[#18181b] outline-none focus:bg-gray-50"
                      placeholder="2024310001"
                      value={row.studentId}
                      onChange={(e) =>
                        updateCell(rowIndex, 'studentId', e.target.value)
                      }
                      onPaste={(e) => handlePaste(e, rowIndex, 'studentId')}
                    />
                  </td>
                  <td className="h-12 border-r border-[#eeeef1] px-1 align-middle">
                    <input
                      className="w-full rounded-sm border-none bg-transparent px-2 py-1 text-[#18181b] outline-none focus:bg-gray-50"
                      placeholder="Hong Gil-dong"
                      value={row.name}
                      onChange={(e) =>
                        updateCell(rowIndex, 'name', e.target.value)
                      }
                      onPaste={(e) => handlePaste(e, rowIndex, 'name')}
                    />
                  </td>
                  <td className="h-12 px-2 text-center align-middle">
                    <button
                      type="button"
                      aria-label="Remove row"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => removeRow(rowIndex)}
                    >
                      <IoClose size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 border-t border-[#eeeef1] bg-[#fbfbfc] py-[13px] text-[15px] font-medium text-[#52525b] hover:bg-[#f4f4f5]"
            onClick={addRow}
          >
            <span className="text-[17px] leading-none">+</span> Add row
          </button>
        </div>
      </div>
    </Modal>
  )
}

/** Wires StudentRosterModal into a react-hook-form form via the "roster"
 *  field, for use inside CourseFormFields (Create/Edit Course). */
export function StudentRosterField() {
  const { watch, setValue } = useFormContext<{ roster?: RosterRow[] }>()
  const rows = watch('roster') ?? []
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="flex h-[52px] w-full items-center justify-between rounded-full border px-5 text-sm"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <span className="bg-color-neutral-10 flex h-5 w-5 items-center justify-center rounded-full text-white">
            +
          </span>
          {rows.length > 0
            ? `${rows.length} students added`
            : 'Add student roster'}
        </span>
        {rows.length > 0 && <span className="text-primary">Edit</span>}
      </button>
      <StudentRosterModal
        rows={rows}
        onSave={(next) => setValue('roster', next)}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
