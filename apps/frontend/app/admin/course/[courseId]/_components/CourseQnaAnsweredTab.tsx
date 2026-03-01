'use client'

import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import { useState } from 'react'

export function CourseQnaAnsweredTab() {
  const [activeTab, setActiveTab] = useState('All Questions')

  return (
    <div>
      <div className="bg-color-commmon-100 flex rounded-full border border-[#D8D8D8] p-[5px]">
        {['All Questions', 'Unanswered Question', 'Private Question'].map(
          (tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'w-[190px] flex-1 py-2 text-base font-normal',
                activeTab === tab
                  ? 'bg-primary border-primary text-white hover:border-blue-600'
                  : 'bg-color-commmon-100 hover:bg-color-neutral-99 text-[#808080]'
              )}
            >
              {tab}
            </Button>
          )
        )}
      </div>
    </div>
  )
}
