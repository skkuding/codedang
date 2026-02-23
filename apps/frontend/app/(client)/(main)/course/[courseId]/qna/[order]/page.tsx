'use client'

import { QnaDetailView } from '@/app/(client)/(main)/course/[courseId]/_components/QnaDetailView'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-500">
          Loading Question Details...
        </div>
      }
    >
      <QnaDetailView />
    </Suspense>
  )
}
