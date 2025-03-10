import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { MdHelpOutline } from 'react-icons/md'
import { Label } from '../../_components/Label'

interface CreateContestLabelProps {
  title: string
  content: string
}

export function CreateContestLabel({
  title,
  content
}: CreateContestLabelProps) {
  const sentences = content
    .split(/(?:\n|<br\s*\/?>)/)
    .map((sentence, index) => (
      <p key={index} className="text-xs font-normal text-black">
        {sentence.trim()}
      </p>
    ))

  return (
    <div className="flex items-center gap-2">
      <Label required={false}>{title}</Label>
      <TooltipProvider>
        <Tooltip>
          {/* 현재 shadcn 컴포넌트 자체에 문제가 있는 것 같음 */}
          <TooltipTrigger asChild>
            <button type="button">
              <MdHelpOutline className="text-gray-400 hover:text-gray-700" />
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
