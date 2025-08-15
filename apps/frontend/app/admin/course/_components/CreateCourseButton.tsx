'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import type { SemesterSeason } from '@/types/type'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { FormSection } from '../../_components/FormSection'
import { CreateCourseForm } from './CreateCourseForm'
import { DropdownForm } from './DropdownForm'
import { InputForm } from './InputForm'

export function CreateCourseButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [coursePrefix, setCoursePrefix] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [courseNumber, setCourseNumber] = useState('')
  const [courseSection, setCourseSection] = useState('')

  const currentYear = new Date().getFullYear()
  const seasons: SemesterSeason[] = ['Spring', 'Summer', 'Fall', 'Winter']

  // 현재 월 기준으로 현재 계절 인덱스 구하기
  const month = new Date().getMonth() + 1
  let currentSeasonIdx = 0
  if (month >= 3 && month <= 5) {
    currentSeasonIdx = 0
  } // Spring
  else if (month >= 6 && month <= 8) {
    currentSeasonIdx = 1
  } // Summer
  else if (month >= 9 && month <= 11) {
    currentSeasonIdx = 2
  } // Fall
  else {
    currentSeasonIdx = 3
  } // Winter

  // 5개 계절 생성 (연도 포함)
  const semesterItems = Array.from({ length: 5 }, (_, i) => {
    const seasonIdx = (currentSeasonIdx + i) % 4
    const yearOffset = Math.floor((currentSeasonIdx + i) / 4)
    return `${currentYear + yearOffset} ${seasons[seasonIdx]}`
  })

  const handleCoursePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase() // 영어만 남기고 대문자로 변환
    setCoursePrefix(value)
    setCourseNumber(value + courseCode) // courseNum 업데이트
    // setValue('courseNum', value + courseCode)
  }

  const handleCourseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // 숫자만 남기기
    setCourseCode(value)
    setCourseNumber(coursePrefix + value)
  }

  const handleCourseSectionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, '')
    setCourseSection(value)
  }

  return (
    <Modal
      size="lg"
      type={'input'}
      title="Create Course"
      headerDescription="You can create your course information here."
      trigger={
        <Button type="button" variant="default" className="w-[120px]">
          <HiMiniPlusCircle className="mr-2 h-5 w-5" />
          <span className="text-lg">Create</span>
        </Button>
      }
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
      className="!pb-0 !pr-[20px]"
    >
      <ScrollArea className="h-full w-full pr-[16px]">
        <CreateCourseForm>
          <div className="flex flex-col gap-[10px]">
            <FormSection
              isFlexColumn={true}
              title="Professor"
              className="gap-[6px]"
            >
              <InputForm placeholder="홍길동" name="professor" type="text" />
            </FormSection>
            <FormSection
              isFlexColumn={true}
              title="Course Title"
              className="gap-[6px]"
            >
              <InputForm
                placeholder="홍길동개론"
                name="courseTitle"
                type="text"
              />
            </FormSection>
            <div className="flex justify-between gap-[6px]">
              <FormSection
                isFlexColumn={true}
                title="Course Code"
                className="w-full gap-[6px]"
              >
                <InputForm
                  placeholder="SWE"
                  name="courseCodePrefix"
                  type="text"
                  maxLength={3}
                  value={coursePrefix}
                  onChange={handleCoursePrefixChange}
                />
              </FormSection>
              <FormSection
                isFlexColumn={true}
                title=""
                className="w-full gap-[6px]"
                isLabeled={false}
              >
                <InputForm
                  placeholder="0000"
                  name="courseCodeSuffix"
                  type="text"
                  maxLength={4}
                  value={courseCode}
                  onChange={handleCourseCodeChange}
                />
              </FormSection>
              <CourseInput value={courseNumber} />
            </div>
            <FormSection
              isFlexColumn={true}
              title="Course Section"
              className="gap-[6px]"
            >
              <InputForm
                placeholder="1"
                name="classNum"
                type="number"
                maxLength={2}
                value={courseSection}
                onChange={handleCourseSectionChange}
              />
            </FormSection>
            <FormSection isFlexColumn={true} title="Week" className="gap-[6px]">
              <DropdownForm name="week" items={[3, 6, 15]} />
            </FormSection>
            <FormSection
              isFlexColumn={true}
              title="Semester"
              className="gap-[6px]"
            >
              <DropdownForm name="semester" items={semesterItems} />
            </FormSection>
            <span className="whitespace-nowrap text-lg">Contact</span>
            <div className="bg-color-neutral-99 flex flex-col gap-[10px] rounded-[10px] p-5">
              <FormSection
                isFlexColumn={true}
                isLabeled={false}
                title="Email"
                className="gap-[6px]"
                titleSize="base"
              >
                <InputForm
                  placeholder="example@skku.edu"
                  name="email"
                  type="text"
                />
              </FormSection>
              <FormSection
                isFlexColumn={true}
                title="Phone Number"
                className="gap-[6px]"
                titleSize="base"
                isLabeled={false}
              >
                <InputForm
                  placeholder="010-1234-5678"
                  name="phoneNum"
                  type="text"
                />
              </FormSection>
              <FormSection
                isFlexColumn={true}
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
                isFlexColumn={true}
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
            <div className="mb-[50px] mt-[20px] flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-[46px] w-full"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                type="submit"
                onClick={() => setIsModalOpen(false)}
                className="h-[46px] w-full"
              >
                Create
              </Button>
            </div>
          </div>
        </CreateCourseForm>
      </ScrollArea>
    </Modal>
  )
}

interface CourseInputProps {
  value: string
}

function CourseInput({ value }: CourseInputProps) {
  const { setValue } = useFormContext()

  setValue('courseNum', value)

  return <> </>
}
