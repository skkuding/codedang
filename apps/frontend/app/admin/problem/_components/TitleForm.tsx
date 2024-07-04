import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFormContext } from 'react-hook-form'
import { inputStyle } from '../utils'
import ErrorMessage from './ErrorMessage'

export default function TitleForm() {
  const {
    register,
    formState: { errors }
  } = useFormContext()
  return (
    <>
      <Input
        id="title"
        type="text"
        placeholder="Name your problem"
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
