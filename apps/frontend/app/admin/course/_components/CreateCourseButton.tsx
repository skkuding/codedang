'use client'

import { OptionModal } from '@/components/OptionModal'
import { Button } from '@/components/shadcn/button'
import ObjectsIcon from '@/public/icons/objects.svg'
import PlusCircleIcon from '@/public/icons/plus-circle.svg'
import SquareIcon from '@/public/icons/square.svg'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function CreateCourseButton() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [option, setOption] = useState<'general' | 'blueprint' | null>(null)

  const handleOptionClick = (option: 'general' | 'blueprint') => {
    setOption(option)
  }

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) {
      setOption(null)
    }
  }

  const handleCreateCourse = (option: 'general' | 'blueprint' | null) => {
    if (option === 'general') {
      router.push('/admin/course/create')
      setIsModalOpen(false)
    } else if (option === 'blueprint') {
      router.push('/admin/course/create/master')
      setIsModalOpen(false)
    }
  }

  return (
    <OptionModal
      open={isModalOpen}
      onOpenChange={handleModalOpenChange}
      title="어떤 유형의 강좌를 생성할까요?"
      description="두 가지 유형을 선택할 수 있습니다."
      iconType="check"
      trigger={
        <Button size="large">
          <PlusCircleIcon className="size-5" />
          <span className="text-sub3_sb_16">강좌 생성</span>
        </Button>
      }
    >
      <div className="flex flex-col gap-2">
        <div
          onClick={() => handleOptionClick('general')}
          className={`hover:bg-primary-light/10 hover:border-primary/50 border-1 flex w-full cursor-pointer items-start gap-[10px] rounded-[10px] px-4 py-5 shadow-[0px_4px_20px_0px_rgba(53,78,116,0.10)] transition-colors duration-200 ${
            option === 'general' ? 'border-primary' : 'border-transparent'
          }`}
        >
          <SquareIcon className="text-color-cool-neutral-15 size-7" />
          <div className="flex flex-col gap-1">
            <span className="text-title1_sb_20">일반 강좌 만들기</span>
            <span className="text-body1_m_16 text-color-neutral-50">
              일반 강좌를 생성합니다.
            </span>
          </div>
        </div>

        <div
          onClick={() => handleOptionClick('blueprint')}
          className={`hover:bg-primary-light/10 hover:border-primary/50 border-1 flex w-full cursor-pointer items-start gap-[10px] rounded-[10px] px-4 py-5 shadow-[0px_4px_20px_0px_rgba(53,78,116,0.10)] transition-colors duration-200 ${
            option === 'blueprint' ? 'border-primary' : 'border-transparent'
          }`}
        >
          <ObjectsIcon className="text-color-cool-neutral-15 size-7" />
          <div className="flex flex-col gap-1">
            <span className="text-title1_sb_20">분반 강좌 만들기</span>
            <span className="text-body1_m_16 text-color-neutral-50">
              분반이 있는 강좌를 생성합니다.
            </span>
          </div>
        </div>

        <Button
          size="large"
          className="mt-3 w-full"
          onClick={() => handleCreateCourse(option)}
          disabled={!option}
        >
          <PlusCircleIcon
            className={`size-5 ${option ? 'text-white' : 'text-color-neutral-60'}`}
          />
          <span className="text-sub3_sb_16">강좌 생성 시작하기</span>
        </Button>
      </div>
    </OptionModal>
  )
}
