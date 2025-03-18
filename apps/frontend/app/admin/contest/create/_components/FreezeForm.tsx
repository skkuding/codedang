import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { Switch } from '@/components/shadcn/switch'
import { cn } from '@/libs/utils'
import React, { useState } from 'react'
import { useFormContext } from 'react-hook-form'

interface FreezeFormProps {
  name: string
}

export function FreezeForm({ name }: FreezeFormProps) {
  const [isEnabled, setIsEnabled] = useState<boolean>(false)
  const [selectedOption, setSelectedOption] = useState<string>('30')
  const {
    register,
    setValue,
    trigger,
    getValues,
    control,
    formState: { errors }
  } = useFormContext()

  // const { field } = useController({
  //   name,
  //   control
  // })

  const options = ['90', '75', '60', '45', '30', '15']

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
        <Select
          value={selectedOption}
          onValueChange={(value) => {
            setSelectedOption(value)
            setValue(name, value)
          }}
          disabled={!isEnabled}
        >
          <SelectTrigger className="flex h-9 w-[307px] items-center rounded-[20px] border border-[#80808040] bg-white px-5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            className="w-[307px] bg-white py-3"
            showScrollButtons={false}
          >
            <SelectGroup className="max-h-[210px]">
              {options.map((option) => (
                <div
                  key={option}
                  className="flex cursor-pointer items-center rounded-xl pl-5 hover:bg-gray-100/80"
                  onClick={() => {
                    setSelectedOption(option)
                    setValue(name, option)
                  }}
                >
                  <span
                    className={cn(
                      'relative z-0 flex h-3 w-3 items-center justify-center rounded-full border',
                      selectedOption === option
                        ? 'border-primary'
                        : 'border-[#C4C4C4]'
                    )}
                  >
                    {selectedOption === option && (
                      <span className="bg-primary absolute z-10 h-[7px] w-[7px] rounded-full" />
                    )}
                  </span>
                  <SelectItem
                    key={option}
                    value={option}
                    className="cursor-pointer gap-2"
                    showCheckIcon={false}
                  >
                    <span className={isEnabled ? '' : 'text-[#8A8A8A]'}>
                      {option} min&nbsp;
                    </span>
                    <span className="text-[#8A8A8A]">Before the End</span>
                  </SelectItem>
                </div>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
