import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { Switch } from '@/components/shadcn/switch'
import { cn } from '@/libs/utils'
import rightArrow from '@/public/icons/arrow-right.svg'
import Image from 'next/image'
import React, { useState } from 'react'
import { useFormContext } from 'react-hook-form'

interface FreezeFormProps {
  name: string
}

export function FreezeForm({ name }: FreezeFormProps) {
  const [isEnabled, setIsEnabled] = useState<boolean>(false)
  const [selectedOption, setSelectedOption] = useState<number>(30)
  const {
    register,
    setValue,
    trigger,
    getValues,
    formState: { errors }
  } = useFormContext()

  const options = [90, 75, 60, 45, 30, 15]

  // TODO: 백엔드 leaderboard freeze api 없음
  return (
    <div className="flex h-[114px] w-[641px] flex-col justify-evenly rounded-xl border border-[#80808040] bg-[#80808014] px-7">
      <div className="flex items-center gap-[54px]">
        <h1 className="text-base font-semibold">Leaderboard Freeze</h1>
        <Switch
          onCheckedChange={() => {
            setValue(name, null)
            setIsEnabled(!isEnabled)
          }}
          checked={isEnabled}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
        />
      </div>
      <div className="flex items-center gap-[77px] text-sm">
        <h1 className="text-base font-semibold">Freeze start time</h1>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-9 w-[307px] items-center rounded-[20px] border border-[#80808040] bg-white px-4">
            <span className={cn(!isEnabled && 'text-[#8A8A8A]')}>
              {selectedOption} min&nbsp;
            </span>
            <span className="mr-2 text-[#8A8A8A]">Before the End</span>
            <Image
              src={rightArrow}
              alt="right arrow"
              style={{
                filter: 'invert(100%)',
                transform: 'rotate(90deg)'
              }}
              width={6}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {options.map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => {
                  setSelectedOption(option)
                  setValue(name, option)
                }}
              >
                {option} min&nbsp;
                <span className="text-[#8A8A8A]">Before the End</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
