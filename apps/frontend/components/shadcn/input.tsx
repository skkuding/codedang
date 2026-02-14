import { cn } from '@/libs/utils'
import * as React from 'react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  sizeVariant?: 'lg' | 'md' | 'sm'
  isError?: boolean
  errorMessage?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      sizeVariant = 'md',
      isError = false,
      errorMessage,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      lg: 'h-[46px] text-base px-[20px]',
      md: 'h-[40px] text-sm px-[18px]',
      sm: 'h-[36px] text-sm px-[18px]'
    }
    const resolvedValue = props.value ?? props.defaultValue
    const [isFilled, setIsFilled] = React.useState<boolean>(
      resolvedValue !== undefined &&
        resolvedValue !== null &&
        String(resolvedValue).length > 0
    )

    React.useEffect(() => {
      const nextValue = props.value ?? props.defaultValue
      setIsFilled(
        nextValue !== undefined &&
          nextValue !== null &&
          String(nextValue).length > 0
      )
    }, [props.value, props.defaultValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsFilled(e.currentTarget.value.length > 0)
      props.onChange?.(e)
    }

    return (
      <div className="flex w-full flex-col">
        <input
          type={type}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          placeholder={props.placeholder ?? 'Enter'}
          data-filled={isFilled ? 'true' : 'false'}
          aria-invalid={isError || undefined}
          onChange={handleChange}
          className={cn(
            'focus-visible:outline-hidden flex w-full rounded-full border bg-white py-2 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-base placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400',
            sizeClasses[sizeVariant],
            isError
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'focus-visible:ring-primary border-gray-200 active:border-gray-400 data-[filled=true]:border-gray-300 dark:border-gray-800 dark:focus-visible:ring-gray-300',
            className
          )}
          ref={ref}
          {...props}
        />
        {isError && errorMessage ? (
          <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
