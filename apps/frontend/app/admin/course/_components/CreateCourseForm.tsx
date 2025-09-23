'use client'

import { CREATE_COURSE } from '@/graphql/course/mutation'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { useApolloClient, useMutation } from '@apollo/client'
import type { CourseInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import type { ReactNode } from 'react'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'
import { courseSchema } from '../_libs/schema'

export function CreateCourseForm({ children }: { children: ReactNode }) {
  const methods = useForm<CourseInput>({
    resolver: valibotResolver(courseSchema),
    defaultValues: {
      professor: '',
      courseTitle: '',
      courseNum: '',
      classNum: 0,
      semester: '',
      week: 0,
      email: '',
      phoneNum: '',
      office: '',
      website: '',
      config: {
        showOnList: true,
        allowJoinFromSearch: true,
        allowJoinWithURL: true,
        requireApprovalBeforeJoin: false
      }
    }
  })

  const [createCourse] = useMutation(CREATE_COURSE)
  const client = useApolloClient()

  const onSubmit: SubmitHandler<CourseInput> = async (data) => {
    try {
      await createCourse({
        variables: {
          input: {
            courseTitle: data.courseTitle,
            courseNum: data.courseNum,
            classNum: data.classNum,
            professor: data.professor,
            semester: data.semester,
            week: Number(data.week),
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
      console.error('Error creating course:', error)
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={methods.handleSubmit(onSubmit)}
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </form>
  )
}
