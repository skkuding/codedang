'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs'
import { usePathname, useRouter } from 'next/navigation'

export function ProblemTabs() {
  const pathname = usePathname()
  const router = useRouter()

  let currentTab: string
  if (pathname.includes('creating')) {
    currentTab = 'creating'
  } else if (pathname.includes('my-problem')) {
    currentTab = 'my-problem'
  } else {
    currentTab = 'published'
  }

  return (
    <Tabs value={currentTab}>
      <TabsList variant="problem">
        <TabsTrigger
          value="published"
          variant="problem"
          onClick={() => router.push(`/problem`)}
        >
          Published
        </TabsTrigger>
        <TabsTrigger
          value="creating"
          variant="problem"
          onClick={() => router.push(`/problem/creating`)}
        >
          Creating
        </TabsTrigger>
        <TabsTrigger
          value="my-problem"
          variant="problem"
          onClick={() => router.push(`/problem/my-problem`)}
        >
          My Problem
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
