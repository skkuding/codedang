import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { AiFillQuestionCircle } from 'react-icons/ai'
import { Label } from '../../_components/Label'

interface CreateEditContestLabelProps {
  title: string
  content: string
}

export function CreateEditContestLabel({
  title,
  content
}: CreateEditContestLabelProps) {
  const sentences = content
    .split(/(?:\n|<br\s*\/?>)/)
    .map((sentence, index) => (
      <p key={index} className="text-caption4_r_12 text-black">
        {sentence.trim()}
      </p>
    ))

  return (
    <div className="flex items-center gap-2">
      <Label required={false}>{title}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button">
              <AiFillQuestionCircle className="h-4 w-4 text-[#B0B0B0]" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="mb-2 w-[640px] bg-white px-4 py-2 shadow-md"
          >
            {sentences}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
