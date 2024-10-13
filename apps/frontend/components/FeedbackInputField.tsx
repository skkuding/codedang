import type { Field, SignUpFormInput } from '@/components/auth/SignUpRegister'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import InputMessage from './InputMessage'

export function FeedbackInputField({
  placeholder,
  fieldName,
  isError,
  enableShowToggle = false,
  formMethods,
  Messages
}: {
  placeholder: string
  fieldName: Field
  isError: boolean
  enableShowToggle?: boolean
  formMethods: UseFormReturn<SignUpFormInput>
  Messages: {
    text: string
    isVisible: boolean
    type?: 'error' | 'description' | 'available'
  }[]
  children?: React.ReactNode
}) {
  const [hasBeenFocused, setHasBeenFocused] = useState<boolean>(false)
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [passwordShow, setPasswordShow] = useState<boolean>(true)
  const {
    register,
    getValues,
    trigger,
    formState: { dirtyFields }
  } = formMethods

  return (
    <div className="flex w-full flex-col gap-1">
      <div
        className={
          enableShowToggle ? 'relative flex justify-between gap-2' : ''
        }
      >
        <Input
          placeholder={placeholder}
          {...register(fieldName, {
            onChange: () => trigger(fieldName as keyof SignUpFormInput)
          })}
          className={cn(
            'focus-visible:ring-0',
            (hasBeenFocused || dirtyFields[fieldName]) &&
              (isError && (getValues(fieldName) || !isFocused)
                ? 'border-red-500 focus-visible:border-red-500'
                : 'border-primary')
          )}
          type={passwordShow ? 'text' : 'password'}
          onFocus={() => {
            trigger(fieldName as keyof SignUpFormInput)
            setHasBeenFocused(true)
            setIsFocused(true)
          }}
          onBlur={() => {
            setIsFocused(false)
          }}
        />
        {enableShowToggle && (
          <span
            className="absolute right-0 top-0 flex h-full p-3"
            onClick={() => setPasswordShow(!passwordShow)}
          >
            {passwordShow ? (
              <FaEye className="text-gray-400" />
            ) : (
              <FaEyeSlash className="text-gray-400" />
            )}
          </span>
        )}
      </div>
      {Messages.filter((message) => {
        if (!message.isVisible) return false
        switch (message.type) {
          case 'error':
            return getValues(fieldName) || !isFocused
          case 'description':
            return !getValues(fieldName) && isFocused
          case 'available':
            return !isError
        }
      }).map((message, index) => (
        <p
          key={index}
          className={
            message.type === 'description'
              ? 'text-xs text-gray-700'
              : 'text-primary text-xs'
          }
        >
          {InputMessage(message.text, message.type)}
        </p>
      ))}
    </div>
  )
}
