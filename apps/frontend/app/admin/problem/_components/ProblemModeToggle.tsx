'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { Switch } from '@/components/shadcn/switch'
import InfoIcon from '@/public/icons/icon-info-blue.svg'
import { useProblemCreationMode } from '../_libs/useProblemCreationMode'

export function ProblemModeToggle() {
  const { useMandeuldang, setUseMandeuldang } = useProblemCreationMode()

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="text-sm text-slate-500">기존 방식</span>
      <Switch checked={useMandeuldang} onCheckedChange={setUseMandeuldang} />
      <span className="text-sm text-slate-500">만들당 방식</span>
      <Popover>
        <PopoverTrigger type="button">
          <InfoIcon width={16} height={16} />
        </PopoverTrigger>
        <PopoverContent className="w-64 text-sm">
          만들당은 문제 본문 작성부터 솔루션 검증, 테스트케이스 생성, 협업자
          초대까지 한 흐름에서 진행할 수 있는 새로운 문제 제작 방식입니다.
        </PopoverContent>
      </Popover>
    </div>
  )
}
