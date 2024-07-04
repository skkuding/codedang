import { Popover } from '@headlessui/react'
import { PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import { useFormContext, useController } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { MdHelpOutline } from 'react-icons/md'
import ErrorMessage from './ErrorMessage'

export default function VisibleForm() {
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const { field: isVisibleField } = useController({
    name: 'isVisible',
    control,
    defaultValue: true
  })

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button>
            <MdHelpOutline className="text-gray-400 hover:text-gray-700" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" className="mb-2 px-4 py-3">
          <ul className="text-sm font-normal leading-none">
            <li>For contest, &apos;hidden&apos; is recommended.</li>
            <li>You can edit these settings later.</li>
          </ul>
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-2">
        <div className="flex gap-6">
          <label className="flex gap-2">
            <input
              type="radio"
              onBlur={isVisibleField.onBlur}
              onChange={() => isVisibleField.onChange(true)}
              checked={isVisibleField.value === true}
              className="accent-black"
            />
            <FaEye
              className={
                isVisibleField.value === true ? 'text-black' : 'text-gray-400'
              }
            />
          </label>
          <label className="flex gap-2">
            <input
              type="radio"
              onBlur={isVisibleField.onBlur}
              onChange={() => isVisibleField.onChange(false)}
              checked={isVisibleField.value === false}
              className="accent-black"
            />
            <FaEyeSlash
              className={
                isVisibleField.value === false ? 'text-black' : 'text-gray-400'
              }
            />
          </label>
        </div>
      </div>
      {errors.isVisible && <ErrorMessage message="required" />}
    </>
  )
}
