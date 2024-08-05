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
      <PopoverContent side="top" className="mb-2 w-max px-3 py-2">
        <ul className="text-xs font-normal leading-tight text-gray-700">
          <li>
            If set to visible, the problem will be publicly accessible, allowing
            users to attempt solving it.
          </li>
          <li>
            Please note that the visibility settings can be modified at any
            time.
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  )
}
