'use client'

import type { SemesterSeason } from '@/types/type'
import { useTranslate } from '@tolgee/react'
import { useState } from 'react'
import { FormSection } from '../../_components/FormSection'
import { DropdownForm } from './DropdownForm'
import { InputForm } from './InputForm'

export function CourseFormFields() {
  const [courseNumber, setCourseNumber] = useState('')
  const { t } = useTranslate()

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
      <FormSection
        isFlexColumn
        title={t('professor-title')}
        className="gap-[6px]"
      >
        <InputForm
          placeholder={t('professor-placeholder')}
          name="professor"
          type="text"
        />
      </FormSection>
      <FormSection
        isFlexColumn
        title={t('course_title-title')}
        className="gap-[6px]"
      >
        <InputForm
          placeholder={t('course_title-placeholder')}
          name="courseTitle"
          type="text"
        />
      </FormSection>
      <div className="flex justify-between gap-[10px]">
        <FormSection
          isFlexColumn
          title={t('course_code-title')}
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
      <FormSection
        isFlexColumn
        title={t('course_section-title')}
        className="gap-[6px]"
      >
        <InputForm
          placeholder="1"
          name="classNum"
          type="number"
          maxLength={2}
        />
      </FormSection>
      <FormSection isFlexColumn title={t('week-title')} className="gap-[6px]">
        <DropdownForm name="week" items={[3, 6, 15]} />
      </FormSection>
      <FormSection
        isFlexColumn
        title={t('semester-title')}
        className="gap-[6px]"
      >
        <DropdownForm name="semester" items={semesterItems} />
      </FormSection>
      <span className="whitespace-nowrap text-lg">{t('contact-text')}</span>
      <div className="bg-color-neutral-99 flex flex-col gap-[10px] rounded-[10px] p-5">
        <FormSection
          isFlexColumn
          isLabeled={false}
          title={t('email-title')}
          className="gap-[6px]"
          titleSize="base"
        >
          <InputForm placeholder="example@skku.edu" name="email" type="email" />
        </FormSection>
        <FormSection
          isFlexColumn
          title={t('phone_number-title')}
          className="gap-[6px]"
          titleSize="base"
          isLabeled={false}
        >
          <InputForm placeholder="010-1234-5678" name="phoneNum" type="text" />
        </FormSection>
        <FormSection
          isFlexColumn
          title={t('office-title')}
          className="gap-[6px]"
          titleSize="base"
          isLabeled={false}
        >
          <InputForm
            placeholder={t('office-placeholder')}
            name="office"
            type="text"
          />
        </FormSection>
        <FormSection
          isFlexColumn
          title={t('website-title')}
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
