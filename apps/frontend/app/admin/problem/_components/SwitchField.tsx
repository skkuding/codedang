import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import Label from '../_components/Label'
import { inputStyle } from '../utils'

interface SwitchFieldProps {
  name: string
  title?: string
  placeholder?: string
  isInput?: boolean
}

export default function SwitchField({
  name,
  title,
  placeholder,
  isInput = false
}: SwitchFieldProps) {
  const [isEnabled, setIsEnabled] = useState(true)
  const { register, setValue } = useFormContext()

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Label required={false}>{title}</Label>
        <Switch
          onCheckedChange={() => {
            setIsEnabled(!isEnabled)
            setValue(name, '')
          }}
          checked={isEnabled}
          className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
        />
      </div>
      {isEnabled &&
        (isInput ? (
          <Input
            id={name}
            type="text"
            placeholder={placeholder}
            className={cn(inputStyle, 'h-[36px] w-[380px]')}
            {...register('source')}
          />
        ) : (
          <Textarea
            id={name}
            placeholder={placeholder}
            className="min-h-[120px] w-[760px] bg-white"
            {...register(name)}
          />
        ))}
    </div>
  )
}
