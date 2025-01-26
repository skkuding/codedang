import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'

export function ContestSummary({
  buttonname,
  summary
}: {
  buttonname: string
  summary: string
}) {
  return (
    <div className="flex flex-row items-start">
      <Button
        variant={'outline'}
        className={cn(
          'mr-[14px] h-7 w-[87px] rounded-[14px] px-[17px] py-1 text-sm font-medium md:block'
        )}
      >
        {buttonname}
      </Button>
      <p className="w-[838px] text-[#333333e6]">{summary}</p>
    </div>
  )
}
