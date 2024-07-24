import { Button } from '@/components/ui/button'
import { PlusCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useFormContext } from 'react-hook-form'

export default function ImportProblemButton({
  disabled,
  isCreatePage,
  id
}: {
  disabled: boolean
  isCreatePage: boolean
  id?: number
}) {
  const { getValues } = useFormContext()
  const router = useRouter()
  return (
    <Button
      type="button"
      className="flex h-[36px] w-36 items-center gap-2 px-0"
      disabled={disabled}
      onClick={() => {
        const formData = {
          title: getValues('title'),
          startTime: getValues('startTime'),
          endTime: getValues('endTime'),
          description: getValues('description'),
          invitationCode: getValues('invitationCode')
        }
        if (isCreatePage) {
          localStorage.setItem('contestFormData', JSON.stringify(formData))
          router.push('/admin/problem?import=true')
        } else {
          localStorage.setItem(
            `contestFormData-${id}`,
            JSON.stringify(formData)
          )
          router.push(`/admin/problem?import=true&contestId=${id}`)
        }
      }}
    >
      <PlusCircleIcon className="h-4 w-4" />
      <div className="mb-[2px] text-sm">Import Problem</div>
    </Button>
  )
}
