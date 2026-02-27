import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import React from 'react'
import { ContestFeatureCard } from './ContestFeatureCard'

interface ContestFeatureListProps {
  title: string
}

const featureTitles = [
  'REAL-TIME\nLEADERBOARD',
  'USER-DEFINED\nTESTCASE',
  'FLEXIBLE\n SPECIAL JUDGE',
  'STATISTICS\nOF CONTEST'
]

const featureDescriptions = [
  'View the rankings directly within the IDE during the contest.',
  'Add various inputs before submission without affecting your penalty.',
  'Evaluate diverse answers even for specific-condition problems.',
  'Check the first solver, success rate, the number of submission and more.'
]

export function ContestFeatureList({ title }: ContestFeatureListProps) {
  return (
    <Carousel className="flex w-full max-w-[1440px] flex-col gap-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-head5_sb_24 text-gray-700">{title} </h1>
        <div className="flex items-center justify-end gap-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </div>
      <div className="-mx-24">
        <CarouselContent className="my-[14px] ml-24 mr-3 gap-4">
          {featureTitles.map((title, index) => (
            <CarouselItem key={index} className="flex pl-0">
              <ContestFeatureCard
                index={index}
                title={title}
                description={featureDescriptions[index]}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>
    </Carousel>
  )
}
