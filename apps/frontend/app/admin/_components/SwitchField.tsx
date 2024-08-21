import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { inputStyle } from '../utils'
import ErrorMessage from './ErrorMessage'
import Label from './Label'

interface SwitchFieldProps {
  name: string
  title?: string
  placeholder?: string
  formElement?: 'input' | 'textarea'
  type?: string
  hasValue?: boolean
}

export default function SwitchField({
  name,
  title,
  placeholder,
  formElement,
  type = 'text',
  hasValue = false
}: SwitchFieldProps) {
  const [isEnabled, setIsEnabled] = useState<boolean>(false)
  const {
    register,
    setValue,
    trigger,
    getValues,
    formState: { errors }
  } = useFormContext()

  useEffect(() => {
    setIsEnabled(hasValue)
  }, [hasValue])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Label required={false}>{title}</Label>
        <Switch
          onCheckedChange={() => {
            if (name == 'invitationCode') setValue(name, null)
            else if (name == 'hint' || name == 'source') setValue(name, '')
            else setValue(name, !getValues(name))
            setIsEnabled(!isEnabled)
          }}
          checked={isEnabled}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
        />
      </div>
      {isEnabled &&
        (formElement == 'input' ? (
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            className={cn(
              inputStyle,
              'h-[36px] w-[380px]',
              '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
            )}
            {...register(name, {
              onChange: () => trigger(name)
            })}
          />
        ) : formElement == 'textarea' ? (
          <Textarea
            id={name}
            placeholder={placeholder}
            className="min-h-[120px] w-[760px] bg-white"
            {...register(name)}
          />
        ) : null)}
      {isEnabled && name == 'invitationCode' && errors[name] && (
        <ErrorMessage message="The invitation code must be a 6-digit number" />
      )}
    </div>
  )
}
