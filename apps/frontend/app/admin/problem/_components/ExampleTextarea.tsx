import { Textarea } from '@/components/shadcn/textarea'
import { cn } from '@/lib/utils'
import { RxCross2 } from 'react-icons/rx'

interface ExampleTextareaProps {
  onRemove: () => void
  inputName: string
  outputName: string
  className?: string
  // TODO: any를 다른 type으로 대체
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any
  blockEdit?: boolean
}
export default function ExampleTextarea({
  onRemove,
  inputName,
  outputName,
  className,
  register,
  blockEdit
}: ExampleTextareaProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-[120px] w-full rounded-md border border-gray-200 bg-gray-50 py-3 font-mono shadow-sm',
        className
      )}
    >
      {!blockEdit && (
        <button
          type="button"
          className="absolute right-2 top-2 w-3 p-0 text-gray-400"
          onClick={onRemove}
        >
          <RxCross2 />
        </button>
      )}
      <Textarea
        disabled={blockEdit}
        placeholder="Input"
        className="resize-none border-0 px-4 py-0 shadow-none focus-visible:ring-0"
        {...register(inputName)}
      />
      <Textarea
        disabled={blockEdit}
        placeholder="Output"
        className="min-h-[120px] rounded-none border-l border-transparent border-l-gray-200 px-4 py-0 shadow-none focus-visible:ring-0"
        {...register(outputName)}
      />
    </div>
  )
}
