import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { inputStyle } from '../utils'
import Label from './Label'

interface SwitchFieldProps {
  name: string
  title?: string
  placeholder?: string
  isInput?: boolean
  type?: string
  hasValue?: boolean
}

export default function SwitchField({
  name,
  title,
  placeholder,
  isInput = false,
  type = 'text',
  hasValue = false
}: SwitchFieldProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const { register, setValue } = useFormContext()

  useEffect(() => {
    setIsEnabled(hasValue)
  }, [hasValue])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Label required={false}>{title}</Label>
        <Switch
          onCheckedChange={() => {
            setIsEnabled(!isEnabled)
            setValue(name, name === 'invitationCode' ? null : '')
          }}
          checked={isEnabled}
          className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
        />
      </div>
      {isEnabled &&
        (isInput ? (
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            className={cn(
              inputStyle,
              'h-[36px] w-[380px]',
              '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
            )}
            {...register(name)}
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
