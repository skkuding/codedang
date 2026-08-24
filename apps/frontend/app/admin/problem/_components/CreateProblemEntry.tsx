'use client'

import { Button } from '@/components/shadcn/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { Switch } from '@/components/shadcn/switch'
import InfoIcon from '@/public/icons/icon-info-blue.svg'
import type { Route } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'

export function CreateProblemEntry() {
  const [useMandeuldang, setUseMandeuldang] = useState(false)
  const createHref = (
    useMandeuldang ? '/admin/problem/mandeuldang' : '/admin/problem/create'
  ) as Route

  return (
    <div className="flex items-center gap-3">
      <Button variant="default" className="w-[120px]" asChild>
        <Link href={createHref}>
          <HiMiniPlusCircle className="mr-2 h-5 w-5" />
          <span className="text-lg">Create</span>
        </Link>
      </Button>
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
    </div>
  )
}
