'use client'

import { Input } from '@/components/shadcn/input'
import { Switch } from '@/components/shadcn/switch'
import { Textarea } from '@/components/shadcn/textarea'
import { cn } from '@/libs/utils'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { inputStyle } from '../_libs/utils'
import { ErrorMessage } from './ErrorMessage'
import { Label } from './Label'

interface SwitchFieldProps {
  name: string
  title?: string
  placeholder?: string
  formElement?: 'input' | 'textarea'
  type?: string
  hasValue?: boolean
}

export function SwitchField({
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
            if (name === 'invitationCode') {
              setValue(name, null)
            } else if (name === 'hint' || name === 'source') {
              setValue(name, '')
            } else {
              setValue(name, !getValues(name))
            }
            setIsEnabled(!isEnabled)
          }}
          checked={isEnabled}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
        />
      </div>
      {isEnabled &&
        (() => {
          if (formElement === 'input') {
            return (
              <Input
                id={name}
                type={type}
                placeholder={placeholder}
                className={cn(
                  inputStyle,
                  'hide-spin-button h-[36px] w-[380px]'
                )}
                {...register(name, {
                  onChange: () => trigger(name)
                })}
              />
            )
          }

          if (formElement === 'textarea') {
            return (
              <Textarea
                id={name}
                placeholder={placeholder}
                className="min-h-[120px] w-[760px] bg-white"
                {...register(name)}
              />
            )
          }

          return null
        })()}
      {isEnabled && name === 'invitationCode' && errors[name] && (
        <ErrorMessage message={errors[name]?.message?.toString()} />
      )}
    </div>
  )
}
