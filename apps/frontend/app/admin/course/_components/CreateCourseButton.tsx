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
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors }
  } = useForm<CourseInput>({
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

  const [prefix, setPrefix] = useState('')
  const [courseCode, setCourseCode] = useState('')
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
            courseNum: `${prefix}${courseCode}`,
            classNum: Number(data.classNum),
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

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase() // 대문자로 변환
    setPrefix(value)
    setValue('courseNum', prefix + courseCode)
  }

  const handleCourseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // 숫자만 남기기
    setCourseCode(value)
    setValue('courseNum', prefix + courseCode)
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
                />
              </FormSection>
              <FormSection
                isFlexColumn={true}
                title=""
                className="w-full gap-[6px]"
                isLabeled={false}
              >
                <InputForm
                  placeholder="1234"
                  name="courseCodeSuffix"
                  type="text"
                />
              </FormSection>
            </div>
            <FormSection
              isFlexColumn={true}
              title="Course Section"
              className="gap-[6px]"
            >
              <InputForm placeholder="01" name="classNum" type="number" />
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
          </div>
        </CreateCourseForm>
        {/* <form
          onSubmit={handleSubmit(onSubmit)}
          aria-label="Create course"
          className="flex flex-col gap-3 [&>*]:px-1"
        >


          <div className="flex justify-between gap-4">
            <div className="flex w-2/3 flex-col gap-2">
              <div className="flex gap-2">
                <span className="font-bold">Course Code</span>
                <span className="text-red-500">*</span>
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="SWE"
                  value={prefix}
                  onChange={handlePrefixChange}
                  maxLength={3}
                  className="w-full rounded border p-2"
                />
                <Input
                  type="text"
                  placeholder="0000"
                  value={courseCode}
                  onChange={handleCourseCodeChange}
                  maxLength={4}
                  className="w-full rounded border p-2"
                />
              </div>
              {errors.courseNum && <ErrorMessage />}
            </div>
            <div className="flex w-1/3 flex-col gap-2">
              <div className="flex gap-2">
                <span className="font-bold">Class Section</span>
              </div>

              <Input
                {...register('classNum', {
                  setValueAs: (v) => parseInt(v)
                })}
                type="number"
                maxLength={2}
                className="w-full rounded border p-2"
              />

              {errors.classNum && (
                <ErrorMessage message={errors.classNum.message} />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <span className="font-bold">Semester</span>
              <span className="text-red-500">*</span>
            </div>
            <Select
              onValueChange={(value) => {
                setValue('semester', value)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                {seasons.map((season) => (
                  <SelectItem
                    key={`${currentYear} ${season}`}
                    value={`${currentYear} ${season}`}
                  >
                    {currentYear} {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.semester && (
              <ErrorMessage message={errors.semester.message} />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <span className="font-bold">Week</span>
              <span className="text-red-500">*</span>
            </div>
            <Select
              onValueChange={(weekCount) => {
                const parsedWeekCount = parseInt(weekCount, 10)
                setValue('week', parsedWeekCount)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                {[3, 6, 16].map((week) => (
                  <SelectItem key={week} value={week.toString()}>
                    {week} {week === 1 ? 'Week' : 'Weeks'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.week && <ErrorMessage message={errors.week.message} />}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <span className="font-bold">Contact</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-normal">Email</span>
              <Input
                {...register('email')}
                type="emailemail"
                className="w-full rounded border p-2"
              />
              {errors.email && <ErrorMessage message={errors.email.message} />}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-normal">Phone Number</span>
              <Input
                {...register('phoneNum')}
                type="text"
                className="w-full rounded border p-2"
              />
              {errors.phoneNum && <ErrorMessage />}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-normal">Office</span>
              <Input
                {...register('office')}
                type="text"
                className="w-full rounded border p-2"
              />
              {errors.office && <ErrorMessage />}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-normal">Website</span>
              <Input
                {...register('website')}
                type="text"
                className="w-full rounded border p-2"
              />
              {errors.website && (
                <ErrorMessage message={errors.website.message} />
              )}
            </div>
          </div>
        </form> */}
      </ScrollArea>
    </Modal>
  )
}
