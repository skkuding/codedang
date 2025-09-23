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

  let currentSeasonIdx = 0
  if (month >= 3 && month <= 5) {
    currentSeasonIdx = 0
  } else if (month >= 6 && month <= 8) {
    currentSeasonIdx = 1
  } else if (month >= 9 && month <= 11) {
    currentSeasonIdx = 2
  } else {
    currentSeasonIdx = 3
  }

  const semesterItems = Array.from({ length: 5 }, (_, i) => {
    const seasonIdx = (currentSeasonIdx + i) % 4
    const yearOffset = Math.floor((currentSeasonIdx + i) / 4)
    return `${currentYear + yearOffset} ${seasons[seasonIdx]}`
  })

  return (
    <div className="flex flex-col gap-[10px]">
      <FormSection isFlexColumn title="Professor" className="gap-[6px]">
        <InputForm placeholder="홍길동" name="professor" type="text" />
      </FormSection>
      <FormSection isFlexColumn title="Course Title" className="gap-[6px]">
        <InputForm placeholder="홍길동개론" name="courseTitle" type="text" />
      </FormSection>
      <div className="flex justify-between gap-[10px]">
        <FormSection
          isFlexColumn
          title="Course Code"
          className="w-full gap-[6px]"
        >
          <InputForm
            placeholder="SWE1234"
            name="courseNum"
            type="text"
            maxLength={7}
            value={courseNumber}
            onChange={handleCourseNumberChange}
          />
        </FormSection>
      </div>
      <FormSection isFlexColumn title="Course Section" className="gap-[6px]">
        <InputForm
          placeholder="1"
          name="classNum"
          type="number"
          maxLength={2}
        />
      </FormSection>
      <FormSection isFlexColumn title="Week" className="gap-[6px]">
        <DropdownForm name="week" items={[3, 6, 15]} />
      </FormSection>
      <FormSection isFlexColumn title="Semester" className="gap-[6px]">
        <DropdownForm name="semester" items={semesterItems} />
      </FormSection>
      <span className="whitespace-nowrap text-lg">Contact</span>
      <div className="bg-color-neutral-99 flex flex-col gap-[10px] rounded-[10px] p-5">
        <FormSection
          isFlexColumn
          isLabeled={false}
          title="Email"
          className="gap-[6px]"
          titleSize="base"
        >
          <InputForm placeholder="example@skku.edu" name="email" type="email" />
        </FormSection>
        <FormSection
          isFlexColumn
          title="Phone Number"
          className="gap-[6px]"
          titleSize="base"
          isLabeled={false}
        >
          <InputForm placeholder="010-1234-5678" name="phoneNum" type="text" />
        </FormSection>
        <FormSection
          isFlexColumn
          title="Office"
          className="gap-[6px]"
          titleSize="base"
          isLabeled={false}
        >
          <InputForm
            placeholder="제2공학관 26B12A호"
            name="office"
            type="text"
          />
        </FormSection>
        <FormSection
          isFlexColumn
          title="Website"
          className="gap-[6px]"
          titleSize="base"
          isLabeled={false}
        >
          <InputForm
            placeholder="https://example.com"
            name="website"
            type="text"
          />
        </FormSection>
      </div>
    </div>
  )
}
