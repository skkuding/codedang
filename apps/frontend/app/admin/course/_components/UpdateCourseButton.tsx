'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { UPDATE_COURSE } from '@/graphql/course/mutation'
import { GET_COURSE } from '@/graphql/course/queries'
import { useMutation, useQuery } from '@apollo/client'
import type { CourseInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslate } from '@tolgee/react'
import { useState } from 'react'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'
import { FaPen } from 'react-icons/fa6'
import { toast } from 'sonner'
import { useDataTable } from '../../_components/table/context'
import { courseSchema } from '../_libs/schema'
import { CourseFormFields } from './CourseFormFields'

interface UpdateCourseButtonProps {
  onSuccess?: () => void
}

interface TableRowData {
  id: number
  groupName: string
  courseInfo: {
    courseNum: string
    classNum: number
    professor: string
    semester: string
    week: number
    email: string
    website: string
    office: string
    phoneNum: string
  }
}

export function UpdateCourseButton({ onSuccess }: UpdateCourseButtonProps) {
  const [updateCourse] = useMutation(UPDATE_COURSE)
  const methods = useForm<CourseInput>({
    resolver: valibotResolver(courseSchema),
    mode: 'onChange',
    defaultValues: {
      config: {
        showOnList: true,
        allowJoinFromSearch: true,
        allowJoinWithURL: true,
        requireApprovalBeforeJoin: false
      }
    }
  })

  const { t } = useTranslate()

  const { table } = useDataTable<TableRowData>()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { refetch } = useQuery(GET_COURSE, {
    variables: { groupId: 0 },
    skip: true
  })

  const handleUpdateButtonClick = async () => {
    const selectedRow = table.getSelectedRowModel().rows[0]
    if (!selectedRow) {
      return
    }

    try {
      const result = await refetch({ groupId: selectedRow.original.id })
      if (result.data) {
        const data = result.data.getCourse

        methods.reset({
          courseTitle: data.groupName,
          courseNum: data.courseInfo?.courseNum,
          classNum: data.courseInfo?.classNum,
          professor: data.courseInfo?.professor,
          semester: data.courseInfo?.semester,
          week: data.courseInfo?.week,
          email: data.courseInfo?.email,
          website: data.courseInfo?.website,
          office: data.courseInfo?.office,
          phoneNum: data.courseInfo?.phoneNum,
          config: {
            showOnList: true,
            allowJoinFromSearch: true,
            allowJoinWithURL: true,
            requireApprovalBeforeJoin: false
          }
        })
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error('Refetch error:', error)
      toast.error(t('failed_to_load_course_data'))
    }
  }

  const handleUpdateSubmit: SubmitHandler<CourseInput> = (data) => {
    const selectedRow = table.getSelectedRowModel().rows[0]
    const updatePromise = updateCourse({
      variables: {
        groupId: Number(selectedRow.original.id),
        input: data
      }
    })

    toast.promise(updatePromise, {
      loading: t('updating_course_loading'),
      success: () => {
        onSuccess?.()
        table.resetRowSelection()
        setIsModalOpen(false)
        return t('course_updated_successfully')
      },
      error: t('failed_to_update_course')
    })
  }

  return (
    <>
      <Button
        variant="outline"
        type="button"
        onClick={handleUpdateButtonClick}
        disabled={table.getSelectedRowModel().rows.length !== 1}
      >
        <FaPen fontSize={13} color={'#8A8A8A'} />
      </Button>
      <Modal
        size="lg"
        type={'input'}
        title={t('update_course_title')}
        headerDescription={t('update_course_header_description')}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        className="!pb-0 !pr-[20px]"
      >
        <ScrollArea className="h-full w-full pr-[16px]">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleUpdateSubmit)}>
              <CourseFormFields />
              <div className="mb-[50px] mt-[20px] flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-[46px] w-full"
                >
                  {t('cancel_button')}
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="h-[46px] w-full"
                >
                  {t('update_button')}
                </Button>
              </div>
            </form>
          </FormProvider>
        </ScrollArea>
      </Modal>
    </>
  )
}
