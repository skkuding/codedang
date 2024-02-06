import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { RxCross2 } from 'react-icons/rx'

interface ExampleTextareaProps {
  id: number
  onRemove: (id: number) => void
  onInputChange: (input: string) => void
  onOutputChange: (output: string) => void
  className?: string
}
export default function ExampleTextarea({
  id,
  onRemove,
  onInputChange,
  onOutputChange,
  className
}: ExampleTextareaProps) {
  const handleInputChange = (event: { target: { value: string } }) => {
    onInputChange(event.target.value)
  }

  const handleOutputChange = (event: { target: { value: string } }) => {
    onOutputChange(event.target.value)
  }

  return (
    <div
      className={cn(
        'relative flex h-[120px] w-full rounded-md border border-gray-200 bg-gray-50 py-3 shadow-sm',
        className
      )}
    >
      <RxCross2
        className="absolute right-2 top-2 w-3 cursor-pointer p-0 text-gray-400 "
        onClick={() => onRemove(id)}
      />
      <Textarea
        placeholder="Input"
        className="resize-none border-0 px-4 py-0 shadow-none focus-visible:ring-0"
        onChange={handleInputChange}
      />
      <Textarea
        placeholder="Output"
        className="resize-none rounded-none border-l border-transparent border-l-gray-200 px-4 py-0 shadow-none focus-visible:ring-0"
        onChange={handleOutputChange}
      />
    </div>
  )
}
