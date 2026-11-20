'use client'

import { Link2, Pencil } from 'lucide-react'
import { useState } from 'react'

type SectionCardProps = {
  id: string
  sectionNum: string
  students: string[]
  index: number
  onSectionChange: (id: string, value: string) => void
  onAddStudent: (id: string, studentId: string) => void
}

export function SectionCard({
  id,
  sectionNum,
  students,
  index,
  onSectionChange,
  onAddStudent
}: SectionCardProps) {
  const [studentInput, setStudentInput] = useState('')

  const handleAdd = () => {
    const studentId = studentInput.trim()

    if (!studentId) {
      return
    }

    onAddStudent(id, studentId)
    setStudentInput('')
  }

  return (
    <div className="flex w-full flex-col gap-[10px] rounded-[10px] bg-[#F5F5F5] p-5">
      <div className="flex items-center gap-2">
        <Link2 className="size-6 text-[#0760EF]" />
        <h3 className="text-[18px] font-semibold text-[#0760EF]">
          분반 {index + 1}
        </h3>
      </div>

      <div className="flex flex-col gap-[6px]">
        <label
          htmlFor={`section-${id}`}
          className="text-[16px] font-semibold text-[#1C1C1C]"
        >
          Class Section
        </label>

        <input
          id={`section-${id}`}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={sectionNum}
          onChange={(e) => onSectionChange(id, e.target.value)}
          placeholder="1"
          className="h-[46px] w-full rounded-[12px] border border-[#D8D8D8] bg-white px-4 text-[16px] text-[#1C1C1C] outline-none focus:border-[#3581FA]"
        />
      </div>

      <div className="flex flex-col gap-[6px]">
        <label
          htmlFor={`students-${id}`}
          className="text-[16px] font-semibold text-[#1C1C1C]"
        >
          Students
        </label>

        <div className="flex h-[46px] items-center rounded-[12px] border border-[#D8D8D8] bg-white px-4 focus-within:border-[#3581FA]">
          <input
            id={`students-${id}`}
            type="text"
            value={studentInput}
            onChange={(e) => setStudentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
            placeholder="Add student roster"
            className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#C4C4C4]"
          />

          <button
            type="button"
            aria-label="학생 추가"
            onClick={handleAdd}
            className="ml-2 flex size-6 shrink-0 items-center justify-center text-[#A0A0A0] hover:text-[#3581FA]"
          >
            <Pencil className="size-5" />
          </button>
        </div>
      </div>

      {students.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {students.map((studentId, studentIndex) => (
            <span
              key={`${studentId}-${studentIndex}`}
              className="rounded-md border border-[#D8D8D8] bg-white px-3 py-1 text-sm"
            >
              {studentId}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
