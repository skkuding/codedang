import { Input } from '@/components/ui/input'

export default function IdSection({
  isLoading,
  defaultUsername
}: {
  isLoading: boolean
  defaultUsername: string
}) {
  return (
    <>
      <label className="-mb-4 text-xs">ID</label>
      <Input
        placeholder={isLoading ? 'Loading...' : defaultUsername}
        disabled={true}
        className="border-neutral-300 text-neutral-600 placeholder:text-neutral-400 disabled:bg-neutral-200"
      />
    </>
  )
}
