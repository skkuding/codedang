import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { MdHelpOutline } from 'react-icons/md'

export function TimeFormPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button>
          <MdHelpOutline className="text-gray-400 hover:text-gray-700" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="text-caption4_r_12 mb-2 w-max px-3 py-2"
      >
        Submissions are allowed until the due time; the assignment remains
        viewable until the end time.
      </PopoverContent>
    </Popover>
  )
}
