import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { MdHelpOutline } from 'react-icons/md'
import Label from './Label'

export default function ContestProblemListLabel() {
  return (
    <div className="flex items-center gap-2">
      <Label>Contest Problem List</Label>
      <Popover>
        <PopoverTrigger asChild>
          <button>
            <MdHelpOutline className="text-gray-400 hover:text-gray-700" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          className="mb-2 w-[680px] bg-black px-4 py-2 text-white"
        >
          <ul className="text-xs font-normal">
            <li>
              The problems in the contest problem list are initially set to
              &apos;not visible&apos; at the time of creating the contest
            </li>
            <li>
              They become visible according to the specified start time and
              remain inaccessible in the problem list
            </li>
            <li>
              throughout the duration of the contest. After the contest period
              ends, they become visible again in the problem list.
            </li>
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  )
}
