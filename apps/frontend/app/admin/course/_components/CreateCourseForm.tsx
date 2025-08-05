'use client'

import { CREATE_COURSE } from '@/graphql/course/mutation'
import { useMutation } from '@apollo/client'
import type { CourseInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import type { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { courseSchema } from '../_libs/schema'

export function CreateCourseForm({ children }: { children: ReactNode }) {
  const methods = useForm<CourseInput>({
    resolver: valibotResolver(courseSchema),
    defaultValues: {
      professor: '',
      courseTitle: '',
      courseNum: '',
      classNum: 1,
      semester: '',
      week: 1,
      email: '',
      phoneNum: '',
      office: '',
      website: '',
      config: {
        showOnList: false,
        allowJoinFromSearch: false,
        allowJoinWithURL: false,
        requireApprovalBeforeJoin: false
      }
    }
  })

  const [createCourse, { error }] = useMutation(CREATE_COURSE)

  const onSubmit = async () => {
    const input = methods.getValues()

    await createCourse({
      variables: {
        input
      }
    })

    if (error) {
      toast.error('Failed to create course')
      return
    }
    toast.success('Course created successfully')
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
