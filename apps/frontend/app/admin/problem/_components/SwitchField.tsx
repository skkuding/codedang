import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import Label from '../_components/Label'

interface SwitchFieldProps {
  name: string
  title?: string
  placeholder?: string
}

export default function SwitchField({
  name,
  title,
  placeholder
}: SwitchFieldProps) {
  const [isEnabled, setIsEnabled] = useState(false)
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
      {isEnabled && (
        <Textarea
          id={name}
          placeholder={placeholder}
          className="min-h-[120px] w-[760px] bg-white"
          {...register(name)}
        />
      )}
    </div>
  )
}
