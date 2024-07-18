import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { MdHelpOutline } from 'react-icons/md'

export default function PopoverVisibleInfo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button>
          <MdHelpOutline className="text-gray-400 hover:text-gray-700" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="mb-2 px-4 py-3">
        <ul className="text-sm font-normal leading-none">
          <li>For contest, &apos;hidden&apos; is recommended.</li>
          <li>You can edit these settings later.</li>
        </ul>
      </PopoverContent>
    </Popover>
  )
}
