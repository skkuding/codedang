import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { useSettingsContext } from './context'

interface NameSectionProps {
  realName: string
}

export default function NameSection({ realName }: NameSectionProps) {
  const {
    isLoading,
    updateNow,
    defaultProfileValues,
    formState: { register, errors }
  } = useSettingsContext()

  return (
    <>
      <label className="-mb-4 text-xs">Name</label>
      <Input
        placeholder={
          isLoading
            ? 'Loading...'
            : defaultProfileValues.userProfile?.realName || 'Enter your name'
        }
        disabled={!!updateNow}
        {...register('realName')}
        className={cn(
          realName && (errors.realName ? 'border-red-500' : 'border-primary'),
          'placeholder:text-neutral-400 focus-visible:ring-0 disabled:bg-neutral-200'
        )}
      />
      {realName && errors.realName && (
        <div className="-mt-4 inline-flex items-center text-xs text-red-500">
          {errors.realName.message}
        </div>
      )}
    </>
  )
}
