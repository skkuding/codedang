import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { useTranslate } from '@tolgee/react'
import { MdHelpOutline } from 'react-icons/md'
import { Label } from '../../_components/Label'

export function ContestProblemListLabel() {
  const { t } = useTranslate()
  return (
    <div className="flex items-center gap-2">
      <Label required={false}>{t('contest_problem_list_label')}</Label>
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
            <p className="text-xs font-normal text-black">
              {t('contest_problem_list_tooltip')}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
