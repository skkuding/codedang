import { Input } from '@/components/shadcn/input'
import { useSettingsContext } from './context'

export function IdSection() {
  const { isLoading, defaultProfileValues } = useSettingsContext()

  return (
    <>
      <label className="text-caption4_r_12 -mb-4">ID</label>
      <Input
        placeholder={isLoading ? 'Loading...' : defaultProfileValues.username}
        disabled={true}
        className="border-neutral-300 text-neutral-600 placeholder:text-neutral-400 disabled:bg-neutral-200"
      />
    </>
  )
}
