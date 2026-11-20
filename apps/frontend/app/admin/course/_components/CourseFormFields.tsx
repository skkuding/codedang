'use client'

import type { SemesterSeason } from '@/types/type'
import { useState } from 'react'
import { FormSection } from '../../_components/FormSection'
import { ContactForm } from './ContactForm'
import { DropdownForm } from './DropdownForm'
import { InputForm } from './InputForm'

type CourseFormFieldsProps = {
  showSection?: boolean
  showContact?: boolean
}

export function CourseFormFields({
  showSection = true,
  showContact = true
}: CourseFormFieldsProps) {
  const [courseNumber, setCourseNumber] = useState('')

  const handleCourseNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCourseNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
  }

  const currentYear = new Date().getFullYear()
  const seasons: SemesterSeason[] = ['Spring', 'Summer', 'Fall', 'Winter']
  const month = new Date().getMonth() + 1
  const weekOptions = Array.from({ length: 16 }, (_, i) => {
    const week = i + 1
    return { label: `${week} weeks`, value: week }
  })

  let currentSeasonIdx = 0
  let baseYear = currentYear
  if (month >= 3 && month <= 5) {
    currentSeasonIdx = 0
  } else if (month >= 6 && month <= 8) {
    currentSeasonIdx = 1
  } else if (month >= 9 && month <= 11) {
    currentSeasonIdx = 2
  } else {
    if (month <= 2) {
      baseYear = baseYear - 1
    }
    currentSeasonIdx = 3
  }

  const semesterItems = Array.from({ length: 5 }, (_, i) => {
    const seasonIdx = (currentSeasonIdx + i) % 4
    const yearOffset = Math.floor((currentSeasonIdx + i) / 4)
    return `${baseYear + yearOffset} ${seasons[seasonIdx]}`
  })

  return (
    <div className="flex flex-col gap-[10px] px-1">
      <InputForm
        placeholder="홍길동"
        label="Professor"
        name="professor"
        type="text"
      />
      <InputForm
        placeholder="홍길동개론"
        label="Course Title"
        name="courseTitle"
        type="text"
      />
      <div className="flex justify-between gap-[10px]">
        <InputForm
          placeholder="SWE1234"
          name="courseNum"
          type="text"
          label="Course Code"
          maxLength={7}
          value={courseNumber}
          onChange={handleCourseNumberChange}
        />
      </div>
      {showSection && (
        <InputForm
          placeholder="1"
          name="classNum"
          label="Class Section"
          type="number"
          maxLength={2}
        />
      )}
      <DropdownForm
        name="week"
        label="Week"
        items={weekOptions}
        placeholder="16 weeks"
      />
      <DropdownForm
        name="semester"
        label="Semester"
        items={semesterItems}
        placeholder={semesterItems[0]}
      />
      {showContact && <ContactForm />}
    </div>
  )
}
