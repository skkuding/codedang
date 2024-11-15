import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { cn } from '@/lib/utils'
import copyBlueIcon from '@/public/icons/copy-blue.svg'
import { LazyMotion, m, domAnimation } from 'framer-motion'
import Image from 'next/image'
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

export default function CopyButton({
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
                    icon: <Image src={copyBlueIcon} alt="copy" />,
                    style: { backgroundColor: '#f0f8ff' },
                    classNames: {
                      toast: 'inline-flex items-center py-2 px-3 rounded gap-2',
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

function CopyIcon(props: ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5 4H14V5.5H15V4C15 3.44772 14.5523 3 14 3H5C4.44772 3 4 3.44772 4 4V16C4 16.5523 4.44771 17 5 17H7.5V16H5L5 4Z"
        fill="currentColor"
      />
      <rect
        x="9.5"
        y="7.5"
        width="10"
        height="13"
        rx="0.5"
        stroke="currentColor"
      />
    </svg>
  )
}

function CopyCompleteIcon(props: ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M19 12V20H10L10 18.7101C9.65475 18.6074 9.32067 18.4787 9 18.3264V20C9 20.5523 9.44771 21 10 21H19C19.5523 21 20 20.5523 20 20V8C20 7.44772 19.5523 7 19 7H16.899C17.2111 7.3058 17.4946 7.64059 17.7453 8H19V12Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5 4H14V5.28988C14.3452 5.39263 14.6793 5.5213 15 5.67363V4C15 3.44772 14.5523 3 14 3H5C4.44772 3 4 3.44772 4 4V16C4 16.5523 4.44771 17 5 17H7.10102C6.78895 16.6942 6.50539 16.3594 6.25469 16H5L5 12V4Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 17.5C15.0376 17.5 17.5 15.0376 17.5 12C17.5 8.96243 15.0376 6.5 12 6.5C8.96243 6.5 6.5 8.96243 6.5 12C6.5 15.0376 8.96243 17.5 12 17.5ZM15.3536 10.3536C15.5488 10.1583 15.5488 9.84171 15.3536 9.64645C15.1583 9.45118 14.8417 9.45118 14.6464 9.64645L11 13.2929L9.35355 11.6464C9.15829 11.4512 8.84171 11.4512 8.64645 11.6464C8.45118 11.8417 8.45118 12.1583 8.64645 12.3536L10.6464 14.3536L11 14.7071L11.3536 14.3536L15.3536 10.3536Z"
        fill="currentColor"
      />
    </svg>
  )
}
