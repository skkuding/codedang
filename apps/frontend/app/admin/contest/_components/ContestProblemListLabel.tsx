import { Button } from '@/components/shadcn/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { MdHelpOutline } from 'react-icons/md'
import { Label } from '../../_components/Label'

// Edit 페이지 작업이 안들어가서 이 컴포넌트 우선 놔둠. 추후 삭제하고 CreateContestLabel로 대체 예정
export function ContestProblemListLabel() {
  return (
    <div className="flex items-center gap-2">
      <Label required={false}>Contest Problem List</Label>
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
            <p className="text-xs font-normal text-black">
              If a problem is included in at least one ongoing, or upcoming
              contest, it will automatically become invisible state in the ‘All
              Problem List’. You cannot change its visibility until all the
              ongoing or upcoming contests it is part of have ended. After the
              contests are all over, you can manually make the problem visible
              again.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
