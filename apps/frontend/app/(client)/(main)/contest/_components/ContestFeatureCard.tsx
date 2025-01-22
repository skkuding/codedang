import { Card, CardContent } from '@/components/shadcn/card'
import React from 'react'

export function ContestFeatureCard({
  index,
  title,
  description
}: {
  index: number
  title: string
  description: string
}) {
  return (
    <Card className="border-none">
      <CardContent className="flex aspect-square h-[440px] w-[364px] flex-col items-start justify-between gap-3 rounded-xl bg-[#DFEEFF] pb-4 pl-[38px] pr-9 pt-[34px] text-2xl">
        <span className="font-semibold">0{index + 1}</span>
        <span className="font-bold">{title}</span>
        <span className="text-base font-normal text-neutral-600">
          {description}
        </span>
        <div className="h-[200px] w-[290px] bg-gray-500" />
      </CardContent>
    </Card>
  )
}
