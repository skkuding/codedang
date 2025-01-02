import { Input } from '@/components/shadcn/input'
import { useSettingsContext } from './context'

export default function IdSection() {
  const { isLoading, defaultProfileValues } = useSettingsContext()

  return (
    <>
      <label className="-mb-4 text-xs">ID</label>
      <Input
        placeholder={isLoading ? 'Loading...' : defaultProfileValues.username}
        disabled={true}
        className="border-neutral-300 text-neutral-600 placeholder:text-neutral-400 disabled:bg-neutral-200"
      />
    </>
  )
}
