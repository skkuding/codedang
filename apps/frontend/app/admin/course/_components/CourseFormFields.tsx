'use client'

import type { SemesterSeason } from '@/types/type'
import { useState } from 'react'
import { FormSection } from '../../_components/FormSection'
import { DropdownForm } from './DropdownForm'
import { InputForm } from './InputForm'

export function CourseFormFields() {
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
      <InputForm
        placeholder="1"
        name="classNum"
        label="Class Section"
        type="number"
        maxLength={2}
      />
      <DropdownForm
        name="week"
        label="Week"
        items={weekOptions}
        placeholder="16weeks"
      />
      <DropdownForm
        name="semester"
        label="Semester"
        items={semesterItems}
        placeholder={semesterItems[0]}
      />
      <span className="whitespace-nowrap text-lg">Contact</span>
      <div className="bg-color-neutral-99 flex flex-col gap-[10px] rounded-[10px] p-5">
        <div className="flex items-end items-center gap-2">
          <InputForm
            label="Email"
            placeholder="example"
            name="emailLocal"
            type="text"
            className="w-[45%]"
          />
          <span className="select-none py-[10px]">@</span>
          <InputForm
            placeholder="skku.edu"
            name="emailDomain"
            type="text"
            className="w-[55%]"
          />
        </div>
        <div className="flex items-end gap-2">
          <InputForm
            label="Phone Number"
            placeholder="010"
            name="phoneNum1"
            type="text"
            maxLength={3}
            className="w-[28%]"
          />
          <span className="select-none py-[10px]">-</span>
          <InputForm
            placeholder="1234"
            name="phoneNum2"
            type="text"
            maxLength={4}
            className="w-[36%]"
          />
          <span className="select-none py-[10px]">-</span>
          <InputForm
            placeholder="5678"
            name="phoneNum3"
            type="text"
            maxLength={4}
            className="w-[36%]"
          />
        </div>
        <InputForm
          label="Office"
          placeholder="제2공학관 26B12A호"
          name="office"
          type="text"
        />
        <InputForm
          label="Website"
          placeholder="https://example.com"
          name="website"
          type="text"
        />
      </div>
    </div>
  )
}
