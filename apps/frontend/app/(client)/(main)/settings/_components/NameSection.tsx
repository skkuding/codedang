import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { useSettingsContext } from './context'

interface NameSectionProps {
  realName: string
}

export function NameSection({ realName }: NameSectionProps) {
  const {
    isLoading,
    updateNow,
    defaultProfileValues,
    formState: { register, errors }
  } = useSettingsContext()

  return (
    <>
      <label className="text-caption4_r_12 -mb-4">Name</label>
      <Input
        placeholder={
          isLoading
            ? 'Loading...'
            : defaultProfileValues.userProfile?.realName || 'Enter your name'
        }
        disabled={Boolean(updateNow)}
        {...register('realName')}
        className={cn(
          realName && (errors.realName ? 'border-red-500' : 'border-primary'),
          'placeholder:text-neutral-400 focus-visible:ring-0 disabled:bg-neutral-200'
        )}
      />
      {realName && errors.realName && (
        <div className="text-caption4_r_12 -mt-4 inline-flex items-center text-red-500">
          {errors.realName.message}
        </div>
      )}
    </>
  )
}
