import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFormContext } from 'react-hook-form'
import { inputStyle } from '../problem/utils'
import ErrorMessage from './ErrorMessage'

export default function TitleForm({ placeholder }: { placeholder: string }) {
  const {
    register,
    formState: { errors }
  } = useFormContext()
  return (
    <>
      <Input
        id="title"
        type="text"
        placeholder={placeholder}
        className={cn(inputStyle, 'w-[380px]')}
        {...register('title', {
          required: true
        })}
      />
      {errors.title &&
        (errors.title?.type === 'required' ? (
          <ErrorMessage />
        ) : (
          <ErrorMessage message={errors.title.message?.toString()} />
        ))}
    </>
  )
}
