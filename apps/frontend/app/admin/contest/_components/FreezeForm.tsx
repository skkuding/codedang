import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { Switch } from '@/components/shadcn/switch'
// import { freezeMinuteOptions } from '@/libs/constants'
import { cn } from '@/libs/utils'
import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

interface FreezeFormProps {
  name: string
  hasValue?: boolean
  isEdit?: boolean
  isOngoing?: boolean
  diffTime?: number | null
  isFinished?: boolean
}

const options = ['90', '75', '60', '45', '30', '15']

export function FreezeForm({
  name,
  hasValue = false,
  isEdit = false,
  isOngoing = false,
  isFinished = false,
  diffTime
}: FreezeFormProps) {
  const [isEnabled, setIsEnabled] = useState<boolean>(hasValue)
  const { setValue, watch } = useFormContext()
  const [selectedOption, setSelectedOption] = useState<string>(
    diffTime?.toString() || '30'
  )
  const isInitialized = useRef(!isEdit)
  const endTime = watch('endTime')
  const originalFreezeTime = useRef(watch(name)).current

  useEffect(() => {
    if (!isInitialized.current) {
      if (diffTime && options.includes(diffTime.toString())) {
        setSelectedOption(diffTime.toString())
      }
      isInitialized.current = true
      return
    }

    const updateFreezeTime = () => {
      if (isEnabled) {
        if (endTime) {
          const freezeTime = new Date(endTime)
          freezeTime.setMinutes(
            freezeTime.getMinutes() - Number(selectedOption)
          )
          setValue(name, freezeTime)
        }
      } else {
        setValue(name, null)
      }
    }
    updateFreezeTime()
  }, [isEnabled, selectedOption, setValue, name, watch, endTime, diffTime])

  useEffect(() => {
    setIsEnabled(hasValue)
  }, [hasValue, diffTime])

  // Handle the change of freeze time when the user selects a new option from the dropdown(Ongoing / Not Ongoing)
  const handleFreezeTimeChange = (value: string) => {
    const now = new Date()
    const newFreezeTime = new Date(endTime)
    newFreezeTime.setMinutes(newFreezeTime.getMinutes() - Number(value))

    if (isOngoing) {
      if (originalFreezeTime && now >= originalFreezeTime) {
        toast.error('Freeze Time cannot be updated as it has already started.')
        return
      }

      if (originalFreezeTime && newFreezeTime < originalFreezeTime) {
        toast.error(
          'New Freeze Time must be after the Original Freeze Start Time.'
        )
        return
      }
    }

    setSelectedOption(value)
    setValue(name, newFreezeTime)
  }

  return (
    <div
      className={cn(
        'flex h-[114px] w-[641px] flex-col justify-evenly rounded-xl border border-[#80808040] bg-[#80808014] px-7',
        isFinished && 'pointer-events-none'
      )}
    >
      <div className="flex items-center gap-[54px]">
        <h1 className="text-sub3_sb_16">Leaderboard Freeze</h1>
        <Switch
          onCheckedChange={() => {
            setValue(name, null)
            setIsEnabled(!isEnabled)
          }}
          checked={isEnabled}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
        />
      </div>
      <div className="text-body4_r_14 flex items-center gap-[77px]">
        <h1 className="text-sub3_sb_16">Freeze start time</h1>
        <Select
          value={selectedOption}
          onValueChange={(value) => handleFreezeTimeChange(value)}
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
                  onClick={() => handleFreezeTimeChange(option)}
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
                    showSelectIcon={false}
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
