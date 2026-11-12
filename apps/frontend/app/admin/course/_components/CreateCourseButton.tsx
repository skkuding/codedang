'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import ObjectsIcon from '@/public/icons/objects.svg'
import SquareIcon from '@/public/icons/square.svg'
import { useState } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { CourseFormFields } from './CourseFormFields'
import { CreateCourseForm } from './CreateCourseForm'

export function CreateCourseButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <Modal
      size="lg"
      type="custom"
      title="어떤 유형의 강좌를 생성할까요?"
      headerDescription="두 가지 유형을 선택할 수 있습니다."
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
      <ScrollArea className="h-full w-full gap-2 pr-4">
        <div className="flex w-full items-start gap-[10px] rounded-[10px] px-4 py-5 shadow-[0px_4px_20px_0px_rgba(53,78,116,0.10)]">
          <SquareIcon className="text-color-cool-neutral-15 size-7" />
          <div className="flex flex-col gap-1">
            <span className="text-title1_sb_20">일반 강좌 만들기</span>
            <span className="text-body1_m_16 text-color-neutral-50">
              일반 강좌를 생성합니다.
            </span>
          </div>
        </div>
        <div className="flex w-full items-start gap-[10px] rounded-[10px] px-4 py-5 shadow-[0px_4px_20px_0px_rgba(53,78,116,0.10)]">
          <ObjectsIcon className="text-color-cool-neutral-15 size-7" />
          <div className="flex flex-col gap-1">
            <span className="text-title1_sb_20">분반 강좌 만들기</span>
            <span className="text-body1_m_16 text-color-neutral-50">
              분반 강좌를 생성합니다.
            </span>
          </div>
        </div>
      </ScrollArea>
      {/* <ScrollArea className="h-full w-full pr-[16px]">
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
      </ScrollArea> */}
    </Modal>
    // <Modal
    //   size="lg"
    //   type={'input'}
    //   title="Create Course"
    //   headerDescription="You can create your course information here."
    //   trigger={
    //     <Button type="button" variant="default" className="w-[120px]">
    //       <HiMiniPlusCircle className="mr-2 h-5 w-5" />
    //       <span className="text-lg">Create</span>
    //     </Button>
    //   }
    //   open={isModalOpen}
    //   onOpenChange={setIsModalOpen}
    //   className="!pb-0 !pr-[20px]"
    // >
    //   <ScrollArea className="h-full w-full pr-[16px]">
    //     <CreateCourseForm onSuccess={() => setIsModalOpen(false)}>
    //       <CourseFormFields />

    //       <div className="mb-[50px] mt-[20px] flex gap-2">
    //         <Button
    //           variant="outline"
    //           type="button"
    //           onClick={() => setIsModalOpen(false)}
    //           className="h-[46px] w-full"
    //         >
    //           Cancel
    //         </Button>
    //         <Button variant="default" type="submit" className="h-[46px] w-full">
    //           Create
    //         </Button>
    //       </div>
    //     </CreateCourseForm>
    //   </ScrollArea>
    // </Modal>
  )
}
