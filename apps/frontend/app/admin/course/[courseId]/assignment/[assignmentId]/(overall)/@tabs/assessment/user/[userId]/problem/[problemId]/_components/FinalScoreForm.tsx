import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import { Input } from '@/components/shadcn/input'
import { useFormContext } from 'react-hook-form'

export function FinalScoreForm() {
  const {
    register,
    formState: { errors }
  } = useFormContext()

  return (
    <div>
      <Input
        className="hide-spin-button h-9 w-20 rounded-md border border-[#3F444F] bg-[#29303F] focus-visible:ring-1 focus-visible:ring-white"
        type="number"
        id="finalScore"
        step="0.01"
        {...register('finalScore', {
          setValueAs: (value) => Number(value)
        })}
      />
      {errors.finalScore &&
        (errors.finalScore?.type === 'required' ? (
          <ErrorMessage />
        ) : (
          <ErrorMessage message={errors.finalScore.message?.toString()} />
        ))}
    </div>
  )
}
