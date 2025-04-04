import { Label } from '@/app/admin/_components/Label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { MdHelpOutline } from 'react-icons/md'

export function AssignmentProblemListLabel() {
  return (
    <div className="flex items-center gap-2">
      <Label>Problem List</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button">
              <MdHelpOutline className="text-gray-400 hover:text-gray-700" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="mb-2 w-[640px] bg-white px-4 py-2 shadow-md"
          >
            {/* assignment visible 정책 결정 후 문구 확정 */}
            <p className="text-xs font-normal text-black">
              If a problem is included in at least one ongoing, or upcoming
              assignment, it will automatically become invisible state in the
              ‘All Problem List’. You cannot change its visibility until all the
              ongoing or upcoming assignments it is part of have ended. After
              the assignments are all over, you can manually make the problem
              visible again.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
