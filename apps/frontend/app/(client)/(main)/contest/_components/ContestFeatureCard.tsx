import { Card, CardContent } from '@/components/shadcn/card'
import React from 'react'

interface ContestFeatureCardProps {
  index: number
  title: string
  description: string
}

export function ContestFeatureCard({
  index,
  title,
  description
}: ContestFeatureCardProps) {
  return (
    <Card className="border-none">
      <CardContent
        style={{ boxShadow: '3px 3px 10px 0px rgba(0, 0, 0, 0.15)' }}
        className="flex aspect-square h-60 w-[347px] flex-col items-start justify-between gap-3 rounded-[14px] pb-11 pl-[45px] pt-9 text-2xl"
      >
        <span className="text-primary text-head5_sb_24">0{index + 1}</span>
        <span className="text-primary whitespace-pre-line font-bold">
          {title}
        </span>
        <span className="text-body3_r_16 text-neutral-600">{description}</span>
      </CardContent>
    </Card>
  )
}
