'use client'

import { ContactForm } from '@/app/admin/course/_components/ContactForm'
import { CourseFormFields } from '@/app/admin/course/_components/CourseFormFields'
import { CreateCourseForm } from '@/app/admin/course/_components/CreateCourseForm'
import { InputForm } from '@/app/admin/course/_components/InputForm'
import { SectionCard } from '@/app/admin/course/_components/SectionCard'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { ScrollBar } from '@/components/shadcn/scroll-area'
import ArrowLeftIcon from '@/public/icons/arrow-left-thin.svg'
import XCircleIcon from '@/public/icons/x-circle.svg'
import { selectionSetMatchesResult } from '@apollo/client/cache/inmemory/helpers'
import { Item } from '@radix-ui/react-select'
import { Currency } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ConfirmNavigation } from '../../../_components/ConfirmNavigation'

export const dynamic = 'force-dynamic'

type Section = {
  id: string
  sectionNum: string
  student: string[]
}

export default function Page() {
  const router = useRouter()
  const [section, setSections] = useState<Section[]>([
    { id: 'initial', sectionNum: '1', student: [] }
  ])
  const handleincrease = () => {
    setSections((pre) => [
      ...pre,
      {
        id: crypto.randomUUID(),
        sectionNum: '',
        student: []
      }
    ])
  }
  const handledecrease = () => {
    setSections((pre) => (pre.length > 1 ? pre.slice(0, -1) : pre))
  }
  const handleSectionChange = (id: string, value: string) => {
    setSections((pre) =>
      pre.map((section) => {
        if (section.id === id) {
          return {
            ...section,
            sectionNum: value.replace(/[^0-9]/g, '')
          }
        }
        return section
      })
    )
  }
  const handleStudentChange = (id: string, value: string[]) => {
    setSections((pre) =>
      pre.map((item) => (item.id === id ? { ...item, student: value } : item))
    )
  }
  const handleAddStudent = (id: string, studentId: string) => {
    const target = section.find((item) => item.id === id)

    if (!target || studentId.trim() === '') {
      return
    }

    handleStudentChange(id, [...target.student, studentId.trim()])
  }
  const hasDuplicate = section.some((curr, index) =>
    section.some(
      (other, otherindex) =>
        index !== otherindex &&
        curr.sectionNum !== '' &&
        curr.sectionNum === other.sectionNum
    )
  )
  const hasInvalidSection = section.some((curr) => {
    const num = Number(curr.sectionNum)
    return (
      curr.sectionNum.trim() === '' ||
      !Number.isInteger(num) ||
      num < 1 ||
      num > 99
    )
  })
  const cancreateSection = !hasInvalidSection && !hasDuplicate
  return (
    <ConfirmNavigation>
      <ScrollArea className="shrink-0">
        <main className="flex w-full flex-col gap-10 px-20 py-16">
          <div className="flex items-center gap-2">
            <Link href="/admin/course">
              <ArrowLeftIcon className="size-7 hover:text-gray-700/80" />
            </Link>
            <span className="text-head2_b_32">CREATE COURSE</span>
          </div>

          <CreateCourseForm onSuccess={() => router.push('/admin/course')}>
            <CourseFormFields showSection={false} showContact={false} />

            <div className="flex flex-col gap-[6px]">
              <span className="text-sub3_sb_16">생성할 분반 개수</span>

              <div className="box-border inline-grid h-[40px] w-[120px] grid-cols-[40px_40px_40px] overflow-hidden rounded-[4px] border border-[#D8D8D8]">
                <button
                  type="button"
                  aria-label="분반 감소"
                  disabled={section.length <= 1}
                  onClick={handledecrease}
                  className="flex min-w-0 items-center justify-center bg-white p-0 disabled:cursor-not-allowed"
                >
                  <span className="text-[24px] leading-none text-[#8A8A8A]">
                    −
                  </span>
                </button>

                <span className="flex min-w-0 items-center justify-center bg-[#F5F5F5] text-[18px] font-semibold text-[#474747]">
                  {section.length}
                </span>

                <button
                  type="button"
                  aria-label="분반 증가"
                  onClick={handleincrease}
                  className="flex min-w-0 items-center justify-center bg-white p-0"
                >
                  <span className="text-[24px] leading-none text-[#8A8A8A]">
                    +
                  </span>
                </button>
              </div>

              <p className="text-[12px] text-[#8A8A8A]">
                개수를 정하면 그 수 만큼 아래에 Section / Roster 입력 폼이 함께
                나타납니다.
              </p>
            </div>

            {section.map((item, index) => (
              <SectionCard
                key={item.id}
                id={item.id}
                sectionNum={item.sectionNum}
                students={item.student}
                index={index}
                onSectionChange={handleSectionChange}
                onAddStudent={handleAddStudent}
              />
            ))}
            <ContactForm />
            <div className="mb-[50px] mt-5 flex items-center justify-end gap-1">
              <Button
                size="large"
                variant="lined"
                onClick={() => router.push('/admin/course')}
                className="text-sub3_sb_16 h-[56px] w-[127px] gap-[6px]"
              >
                <XCircleIcon className="size-6" />
                Cancel
              </Button>
              <Button
                size="large"
                variant="default"
                className="text-sub3_sb_16 h-[56px] w-[127px]"
              >
                Save
              </Button>
            </div>
          </CreateCourseForm>
        </main>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </ConfirmNavigation>
  )
}
