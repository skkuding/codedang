import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { useTranslate } from '@tolgee/react'
import { MdHelpOutline } from 'react-icons/md'

export function TimeFormPopover() {
  const { t } = useTranslate()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button>
          <MdHelpOutline className="text-gray-400 hover:text-gray-700" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="mb-2 w-max px-3 py-2 text-xs">
        {t('submissions_allowed_info')}
      </PopoverContent>
    </Popover>
  )
}
