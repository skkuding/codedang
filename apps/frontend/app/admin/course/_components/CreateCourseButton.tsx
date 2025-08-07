'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { CREATE_COURSE } from '@/graphql/course/mutation'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import type { SemesterSeason } from '@/types/type'
import { useApolloClient, useMutation } from '@apollo/client'
import type { CourseInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { toast } from 'sonner'
import { FormSection } from '../../_components/FormSection'
import { courseSchema } from '../_libs/schema'
import { CreateCourseForm } from './CreateCourseForm'
import { DropdownForm } from './DropdownForm'
import { InputForm } from './InputForm'

export function CreateCourseButton() {
  const { handleSubmit, setValue } = useForm<CourseInput>({
    resolver: valibotResolver(courseSchema),
    defaultValues: {
      config: {
        showOnList: true,
        allowJoinFromSearch: true,
        allowJoinWithURL: true,
        requireApprovalBeforeJoin: false
      }
    }
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [coursePrefix, setCoursePrefix] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [courseSection, setCourseSection] = useState('')
  const [createCourse] = useMutation(CREATE_COURSE)
  const currentYear = new Date().getFullYear()
  const seasons: SemesterSeason[] = ['Spring', 'Summer', 'Fall', 'Winter']

  const client = useApolloClient()

  const onSubmit: SubmitHandler<CourseInput> = async (data) => {
    try {
      await createCourse({
        variables: {
          input: {
            courseTitle: data.courseTitle,
            courseNum: `${coursePrefix}${courseCode}`,
            classNum: Number(courseSection),
            professor: data.professor,
            semester: data.semester,
            week: data.week,
            email: data.email,
            website: data.website,
            office: data.office,
            phoneNum: data.phoneNum,
            config: data.config
          }
        }
      })

      toast.success('Course created successfully!')
      client.refetchQueries({
        include: [GET_COURSES_USER_LEAD]
      })
    } catch (error) {
      //TODO: error handling
      console.error('Error creating course:', error)
      toast.error('An unexpected error occurred')
    }
  }

  const handleCoursePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase() // 대문자로 변환
    setCoursePrefix(value)
    setValue('courseNum', coursePrefix + courseCode)
  }

  const handleCourseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // 숫자만 남기기
    setCourseCode(value)
    setValue('courseNum', coursePrefix + courseCode)
  }

  const handleCourseSectionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, '') // 숫자만 남기기
    setCourseSection(value)
    setValue('classNum', Number(value)) // value로 변경
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
            </div>
            <FormSection
              isFlexColumn={true}
              title="Course Section"
              className="gap-[6px]"
            >
              <InputForm
                placeholder="00"
                name="classNum"
                type="text"
                maxLength={2}
                value={courseSection}
                onChange={handleCourseSectionChange}
              />
            </FormSection>
            <FormSection isFlexColumn={true} title="Week" className="gap-[6px]">
              <DropdownForm
                name="weekNum"
                items={Array.from({ length: 17 }, (_, i) => (i + 1).toString())}
              />
            </FormSection>
            <FormSection
              isFlexColumn={true}
              title="Semester"
              className="gap-[6px]"
            >
              <DropdownForm
                name="semester"
                items={Array.from({ length: 17 }, (_, i) => (i + 1).toString())}
              />
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
                onClick={() => handleSubmit(onSubmit)()}
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
