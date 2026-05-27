'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { UPDATE_COURSE } from '@/graphql/course/mutation'
import { GET_COURSE } from '@/graphql/course/queries'
import { useMutation, useQuery } from '@apollo/client'
import type { CourseInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
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
  type FormValues = CourseInput & {
    phoneNum1?: string
    phoneNum2?: string
    phoneNum3?: string
    emailLocal?: string
    emailDomain?: string
  }

  const [updateCourse] = useMutation(UPDATE_COURSE)
  const methods = useForm<FormValues>({
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

        // split phoneNum into parts if present
        const phone = data.courseInfo?.phoneNum || ''
        const [p1 = '', p2 = '', p3 = ''] = phone.split('-')

        const email = data.courseInfo?.email || ''
        const [local = '', ...domainParts] = email.split('@')
        const domain = domainParts.join('@')

        methods.reset({
          courseTitle: data.groupName,
          courseNum: data.courseInfo?.courseNum,
          classNum: data.courseInfo?.classNum,
          professor: data.courseInfo?.professor,
          semester: data.courseInfo?.semester,
          week: data.courseInfo?.week,
          email: data.courseInfo?.email,
          emailLocal: local,
          emailDomain: domain,
          website: data.courseInfo?.website,
          office: data.courseInfo?.office,
          phoneNum1: p1,
          phoneNum2: p2,
          phoneNum3: p3,
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
      toast.error('Failed to load course data.')
    }
  }

  const handleUpdateSubmit: SubmitHandler<FormValues> = (data) => {
    // Combine phone parts if present
    const anyPhonePart = data.phoneNum1 || data.phoneNum2 || data.phoneNum3
    if (anyPhonePart) {
      const part1 = String(data.phoneNum1 || '').trim()
      const part2 = String(data.phoneNum2 || '').trim()
      const part3 = String(data.phoneNum3 || '').trim()
      data.phoneNum = `${part1}-${part2}-${part3}`
    } else {
      data.phoneNum = ''
    }
    const local = String(data.emailLocal || '').trim()
    const domain = String(data.emailDomain || '').trim()
    data.email = local || domain ? `${local}@${domain}` : ''
    const selectedRow = table.getSelectedRowModel().rows[0]
    const updatePromise = updateCourse({
      variables: {
        groupId: Number(selectedRow.original.id),
        input: data
      }
    })

    toast.promise(updatePromise, {
      loading: 'Updating course...',
      success: () => {
        onSuccess?.()
        table.resetRowSelection()
        setIsModalOpen(false)
        return 'Course updated successfully!'
      },
      error: 'Failed to update course.'
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
        title="Edit Course"
        headerDescription="You can edit and modify information"
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="h-[46px] w-full"
                >
                  Update
                </Button>
              </div>
            </form>
          </FormProvider>
        </ScrollArea>
      </Modal>
    </>
  )
}
