'use client'

import { Input } from '@/components/shadcn/input'
import { Switch } from '@/components/shadcn/switch'
import { Textarea } from '@/components/shadcn/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { cn } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { MdHelpOutline } from 'react-icons/md'
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
  children?: React.ReactNode | React.ReactNode[]
  tooltip?: boolean
  description?: string
  disabled?: boolean
  invert?: boolean
}

export function SwitchField({
  name,
  title,
  placeholder,
  formElement,
  type = 'text',
  hasValue = false,
  children = null,
  tooltip = false,
  description,
  disabled = false,
  invert = false
}: SwitchFieldProps) {
  const [isEnabled, setIsEnabled] = useState<boolean>(
    invert ? !hasValue : hasValue
  )
  const {
    register,
    setValue,
    trigger,
    getValues,
    formState: { errors }
  } = useFormContext()

  const { t } = useTranslate()

  useEffect(() => {
    setIsEnabled(invert ? !hasValue : hasValue)
  }, [hasValue, invert])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <Label
          disabled={disabled}
          required={false}
          className={cn(name === 'invitationCode' ? 'opacity-100' : '')}
        >
          {title}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button">
                  <MdHelpOutline className="text-gray-400 hover:text-gray-700" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="mb-2 bg-white px-4 py-2 shadow-md"
              >
                {children}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <Switch
          disabled={disabled}
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
                disabled={disabled}
                id={name}
                type={type}
                placeholder={placeholder}
                className={cn(
                  inputStyle,
                  'hide-spin-button h-[36px]',
                  name === 'invitationCode'
                    ? 'mt-3 w-full placeholder:text-center placeholder:text-sm'
                    : 'w-[380px]'
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

      {isEnabled && name === 'invitationCode' && (
        <span className="text-xs text-gray-400">
          {t('switch_field_invitation_code_message')}
        </span>
      )}

      {isEnabled && name === 'invitationCode' && errors[name] && (
        <ErrorMessage message={errors[name]?.message?.toString()} />
      )}
      {description && (
        <p className="text-[11px] text-[#9B9B9B]">{description}</p>
      )}
    </div>
  )
}
