import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import React from 'react'
import { ContestFeatureCard } from './ContestFeatureCard'

const featureTitles = [
  'REAL-TIME LEADERBOARD',
  'SPECIAL JUDGE',
  'USER TESTCASE',
  'STATISTICS OF CONTEST'
]

const featureDescriptions = [
  'You can view the rankings of participants directly within the IDE during the contest.',
  'It can flexibly evaluate a wide range of possible answers.',
  'You can add various inputs yourself before submission.',
  'You can check the number of submissions and accepted participants.'
]

export function ContestFeatureList({ title }: { title: string }) {
  return (
    <Carousel className="flex flex-col gap-[38px]">
      <div className="mx-[100px] flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-700">{title} </h1>
        <div className="flex items-center justify-end gap-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </div>
      <CarouselContent className="ml-[85px]">
        {featureTitles.map((title, index) => (
          <CarouselItem key={index} className="flex gap-3">
            <ContestFeatureCard
              index={index}
              title={title}
              description={featureDescriptions[index]}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
