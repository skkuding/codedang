'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import { cn } from '@/libs/utils'
import { File, FileText, type LucideIcon } from 'lucide-react'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { FaCircleCheck } from 'react-icons/fa6'
import { HiMiniPlusCircle } from 'react-icons/hi2'

type ProblemType = 'General' | 'SpecialJudge'

interface ProblemTypeOption {
  type: ProblemType
  icon: LucideIcon
  title: string
  description: string
  disabled?: boolean
}

const problemTypeOptions: ProblemTypeOption[] = [
  {
    type: 'General',
    icon: File,
    title: '일반 문제 생성',
    description: '정답 결과를 직접 비교하여 채점하는 일반적인 코딩 문제 생성'
  },
  {
    type: 'SpecialJudge',
    icon: FileText,
    title: '특수 채점 문제',
    description: '출력 형식이나 정답 조건을 별도로 검증해야 하는 문제 생성',
    disabled: true
  }
]

interface ProblemTypeSelectModalProps {
  trigger: ReactNode
}

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[748px]! max-w-[calc(100vw-32px)]! rounded-[20px]! p-[34px]! gap-0">
        <DialogHeader className="space-y-0 text-left">
          <FaCircleCheck className="text-primary mb-4 h-9 w-9" />
          <DialogTitle className="text-[32px] font-semibold leading-[130%] tracking-[-0.96px]">
            어떤 유형의 문제를 생성할까요?
          </DialogTitle>
          <DialogDescription className="text-color-neutral-50 mt-3 text-lg tracking-[-0.54px]">
            문제 유형에 맞는 생성 흐름을 선택하여 효율적으로 문제를 제작할 수
            있습니다.
          </DialogDescription>
        </DialogHeader>

        <div
          role="radiogroup"
          aria-label="문제 유형"
          className="mt-7 flex flex-col gap-3"
        >
          {problemTypeOptions.map(
            ({ type, icon: Icon, title, description, disabled }) => {
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
                    'flex w-full items-start gap-4 rounded-xl border-2 bg-white px-5 py-6 text-left transition-colors',
                    isSelected
                      ? 'border-primary'
                      : 'border-transparent shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]',
                    disabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:border-primary/50'
                  )}
                >
                  <Icon className="mt-0.5 h-7 w-7 shrink-0" strokeWidth={1.5} />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-semibold tracking-[-0.72px]">
                        {title}
                      </span>
                      {disabled && (
                        <span className="bg-color-neutral-95 text-color-neutral-50 rounded-sm px-2 py-0.5 text-sm font-medium">
                          준비 중
                        </span>
                      )}
                    </div>
                    <span className="text-color-neutral-50 text-lg tracking-[-0.54px]">
                      {description}
                    </span>
                  </div>
                </button>
              )
            }
          )}
        </div>

        <Button
          type="button"
          onClick={handleStart}
          className="mt-6 h-[68px] w-full rounded-xl text-xl font-medium"
        >
          <HiMiniPlusCircle className="mr-2 h-6 w-6" />
          문제 생성 시작하기
        </Button>
      </DialogContent>
    </Dialog>
  )
}
