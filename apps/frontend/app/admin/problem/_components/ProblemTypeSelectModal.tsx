'use client'

import { OptionModal } from '@/components/OptionModal'
import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import FileIcon from '@/public/icons/file.svg'
import ListIcon from '@/public/icons/list-box.svg'
import PlusCircleIcon from '@/public/icons/plus-circle.svg'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'

type ProblemType = 'General' | 'SpecialJudge'

interface ProblemTypeOption {
  type: ProblemType
  icon: React.ReactNode
  title: string
  description: string
  disabled?: boolean
}

interface ProblemTypeSelectModalProps {
  trigger: ReactNode
}

const problemTypeOptions: ProblemTypeOption[] = [
  {
    type: 'General',
    icon: <FileIcon className="size-7 text-black" />,
    title: '일반 문제 생성',
    description: '정답 결과를 직접 비교하여 채점하는 일반적인 코딩 문제 생성'
  },
  {
    type: 'SpecialJudge',
    icon: <ListIcon className="size-7 text-black" />,
    title: '특수 채점 문제',
    description: '출력 형식이나 정답 조건을 별도로 검증해야 하는 문제 생성',
    disabled: true
  }
]

export function ProblemTypeSelectModal({
  trigger
}: ProblemTypeSelectModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<ProblemType>('General')

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setSelectedType('General')
    }
  }

  const handleStart = () => {
    setOpen(false)
    router.push(
      `/admin/problem/mandeuldang?problemType=${selectedType}` as Route
    )
  }

  return (
    <OptionModal
      open={open}
      onOpenChange={handleOpenChange}
      title="어떤 유형의 문제를 생성할까요?"
      description="문제 유형에 맞는 생성 흐름을 선택하여 효율적으로 문제를 제작할 수 있습니다."
      iconType="check"
      trigger={trigger}
    >
      <div
        role="radiogroup"
        aria-label="문제 유형"
        className="flex flex-col gap-2"
      >
        {problemTypeOptions.map(
          ({ type, icon, title, description, disabled }) => {
            const isSelected = selectedType === type
            return (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'hover:bg-primary-light/10 flex w-full cursor-pointer items-start gap-4 rounded-[10px] border-[1px] bg-white px-4 py-5 transition-colors',
                  isSelected ? 'border-primary' : 'border-transparent',
                  disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:border-primary/50'
                )}
              >
                {icon}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-title1_sb_20">{title}</span>
                    {disabled && (
                      <span className="bg-color-neutral-95 text-color-neutral-50 rounded-sm px-2 py-0.5 text-sm font-medium">
                        준비 중
                      </span>
                    )}
                  </div>
                  <span className="text-body1_m_16 text-color-neutral-50">
                    {description}
                  </span>
                </div>
              </button>
            )
          }
        )}
      </div>

      <Button
        size="large"
        className="w-full"
        onClick={handleStart}
        disabled={!selectedType}
      >
        <PlusCircleIcon
          className={`size-5 ${selectedType ? 'text-white' : 'text-color-neutral-60'}`}
        />
        <span className="text-sub3_sb_16">문제 생성 시작하기</span>
      </Button>
    </OptionModal>
  )
}
