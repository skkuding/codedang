'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { useState } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { CourseFormFields } from './CourseFormFields'
import { CreateCourseForm } from './CreateCourseForm'

export function CreateCourseButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        <CreateCourseForm onSuccess={() => setIsModalOpen(false)}>
          <CourseFormFields />

          <div className="mb-[50px] mt-[20px] flex gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="h-[46px] w-full"
            >
              Cancel
            </Button>
            <Button variant="default" type="submit" className="h-[46px] w-full">
              Create
            </Button>
          </div>
        </CreateCourseForm>
      </ScrollArea>
    </Modal>
  )
}
