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
    <div className="flex flex-col gap-[10px] px-1">
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
        <DropdownForm name="week" items={weekOptions} />
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
          <div className="flex items-center gap-2">
            <InputForm
              placeholder="example"
              name="emailLocal"
              type="text"
              className="w-[45%]"
            />
            <span className="select-none">@</span>
            <InputForm
              placeholder="skku.edu"
              name="emailDomain"
              type="text"
              className="w-[55%]"
            />
          </div>
        </FormSection>
        <FormSection
          isFlexColumn
          title="Phone Number"
          className="gap-[6px]"
          titleSize="base"
          isLabeled={false}
        >
          <div className="flex items-center gap-2">
            <InputForm
              placeholder="010"
              name="phoneNum1"
              type="text"
              maxLength={3}
              className="w-[28%]"
            />
            <span className="select-none">-</span>
            <InputForm
              placeholder="1234"
              name="phoneNum2"
              type="text"
              maxLength={4}
              className="w-[36%]"
            />
            <span className="select-none">-</span>
            <InputForm
              placeholder="5678"
              name="phoneNum3"
              type="text"
              maxLength={4}
              className="w-[36%]"
            />
          </div>
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
