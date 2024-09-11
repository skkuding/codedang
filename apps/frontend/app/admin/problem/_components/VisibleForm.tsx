import { useFormContext, useController } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import ErrorMessage from '../../_components/ErrorMessage'

export default function VisibleForm({ blockEdit }: { blockEdit: boolean }) {
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
        <div className="flex gap-14">
          <label className="flex gap-2">
            <input
              type="radio"
              onBlur={isVisibleField.onBlur}
              onChange={() => isVisibleField.onChange(true)}
              checked={isVisibleField.value === true}
              className="text-primary-light"
              disabled={blockEdit}
            />
            <FaEye className="text-gray-400" size={18} />
          </label>
          <label className="flex gap-2">
            <input
              type="radio"
              onBlur={isVisibleField.onBlur}
              onChange={() => isVisibleField.onChange(false)}
              checked={isVisibleField.value === false}
              className="text-primary-light"
              disabled={blockEdit}
            />
            <FaEyeSlash className="text-gray-400" size={18} />
          </label>
        </div>
      </div>
      {errors.isVisible && <ErrorMessage message="required" />}
    </>
  )
}
