'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { CheckerTab } from './tabs/CheckerTab'
import { TcAutoTab } from './tabs/TcAutoTab'
import { TcInputTab } from './tabs/TcInputTab'
import { TcManualTab } from './tabs/TcManualTab'
import { TcOutputTab } from './tabs/TcOutputTab'
import { ValidationTab } from './tabs/ValidationTab'

const GENERAL_TABS = [TcAutoTab, TcManualTab, ValidationTab]
const SPECIAL_TABS = [TcInputTab, TcOutputTab, ValidationTab, CheckerTab]

type TabValue =
  | (typeof GENERAL_TABS)[number]['value']
  | (typeof SPECIAL_TABS)[number]['value']

export function TcManagePage() {
  const searchParams = useSearchParams()
  const isSpecial = searchParams.get('type') === 'special'
  const tabs = isSpecial ? SPECIAL_TABS : GENERAL_TABS

  const [activeValue, setActiveValue] = useState<TabValue>(tabs[0].value)
  const active = tabs.find((t) => t.value === activeValue) ?? tabs[0]

  const boxStyle = 'border-cool-neutral-40 rounded-[16px] border px-6 py-7'

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        value={activeValue}
        onValueChange={(v) => setActiveValue(v as TabValue)}
      >
        <TabsList variant="underline">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} variant="underline">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {active.cards.map((Card, i) => (
        <div key={i} className={boxStyle}>
          <Card />
        </div>
      ))}
    </div>
  )
}
