import { useFormContext, useController } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
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
      <div className="mt-3 flex items-center gap-2">
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
