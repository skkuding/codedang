import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import { Input } from '@/components/shadcn/input'
import { useFormContext } from 'react-hook-form'

export function FinalScoreForm() {
  const {
    register,
    formState: { errors }
  } = useFormContext()

  return (
    <div className="flex flex-col">
      <Input
        className="hide-spin-button bg-editor-fill-1 border-editor-line-1 w-[100px] rounded-[4px] border px-5 text-center text-[14px] font-normal text-white focus-visible:ring-1 focus-visible:ring-white"
        sizeVariant="sm"
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
