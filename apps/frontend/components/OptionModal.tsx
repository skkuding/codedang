import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import CheckCircleIcon from '@/public/icons/check-circle.svg'
import InfoCircleIcon from '@/public/icons/info.svg'
import { HiMiniPlusCircle } from 'react-icons/hi2'

export interface OptionModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  children?: React.ReactNode
  iconType?: 'check' | 'info'
}

export function OptionModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  iconType = 'check'
}: OptionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="default" className="w-[120px]">
          <HiMiniPlusCircle className="mr-2 h-5 w-5" />
          <span className="text-lg">Create</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="!flex !min-h-[470px] !w-[620px] !flex-col !rounded-2xl !px-7 !py-8">
        <DialogHeader className="mb-2 flex flex-col items-start justify-center gap-[6px] space-y-0">
          {iconType === 'check' ? (
            <CheckCircleIcon className="text-primary-strong mb-2 size-9" />
          ) : (
            <InfoCircleIcon className="text-primary-strong mb-2 size-9" />
          )}
          <DialogTitle className="text-head3_sb_28 w-full">{title}</DialogTitle>
          {description && (
            <p className="text-color-cool-neutral-40 text-body1_m_16 w-full">
              {description}
            </p>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
