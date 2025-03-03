'use client'

import { ProblemTabs } from './_components/ProblemTabs'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col bg-neutral-50">
      <ProblemTabs />
      {children}
    </div>
  )
}
