import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { cn } from '@/libs/utils'
import CopyCompleteIcon from '@/public/icons/copy-complete.svg'
import CopyIcon from '@/public/icons/copy.svg'
import { LazyMotion, m, domAnimation } from 'framer-motion'
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef
} from 'react'
import { useCopyToClipboard } from 'react-use'
import { toast } from 'sonner'

const useCopy = () => {
  const [, copyToClipboard] = useCopyToClipboard()

  const [copied, setCopied] = useState(false)
  const timeoutIDRef = useRef<NodeJS.Timeout | null>(null)

  const copy = (value: string) => {
    copyToClipboard(value)
    setCopied(true)

    if (timeoutIDRef.current) {
      clearTimeout(timeoutIDRef.current)
    }
    timeoutIDRef.current = setTimeout(() => {
      setCopied(false)
      timeoutIDRef.current = null
    }, 2000)
  }

  return { copied, copy }
}

interface CopyButtonProps extends ComponentPropsWithoutRef<'button'> {
  iconSize?: number
  value: string
  withTooltip?: boolean
}

export function CopyButton({
  value,
  iconSize = 24,
  withTooltip = true,
  onClick,
  className,
  ...props
}: CopyButtonProps) {
  const { copied, copy } = useCopy()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        key={copied ? 'check' : 'clipboard'}
        initial={mounted ? { y: 10, opacity: 0 } : undefined}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={cn('flex items-center justify-center', className)}
      >
        {copied ? (
          <CopyCompleteIcon width={iconSize} height={iconSize} />
        ) : (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger
                onClick={(e) => {
                  onClick?.(e)
                  copy(value)
                  toast('Successfully copied', {
                    unstyled: true,
                    closeButton: false,
                    icon: <CopyIcon className="text-primary size-6" />,
                    style: { backgroundColor: '#f0f8ff' },
                    classNames: {
                      toast:
                        'inline-flex items-center py-2 px-3 rounded-xs gap-2',
                      title: 'text-primary font-medium'
                    }
                  })
                }}
                className="transition-opacity hover:opacity-60"
                {...props}
              >
                <CopyIcon width={iconSize} height={iconSize} />
              </TooltipTrigger>
              {withTooltip ? (
                <TooltipContent>
                  <p>Copy</p>
                </TooltipContent>
              ) : null}
            </Tooltip>
          </TooltipProvider>
        )}
      </m.div>
    </LazyMotion>
  )
}
