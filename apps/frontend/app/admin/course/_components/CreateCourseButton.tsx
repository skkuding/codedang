'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { useTranslate } from '@tolgee/react'
import { useState } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { CourseFormFields } from './CourseFormFields'
import { CreateCourseForm } from './CreateCourseForm'

export function CreateCourseButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useTranslate()

  return (
    <Modal
      size="lg"
      type={'input'}
      title={t('create_course_title')}
      headerDescription={t('create_course_header_description')}
      trigger={
        <Button type="button" variant="default" className="w-[120px]">
          <HiMiniPlusCircle className="mr-2 h-5 w-5" />
          <span className="text-lg">{t('create_button')}</span>
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
              {t('cancel_button')}
            </Button>
            <Button variant="default" type="submit" className="h-[46px] w-full">
              {t('create_button')}
            </Button>
          </div>
        </CreateCourseForm>
      </ScrollArea>
    </Modal>
  )
}
