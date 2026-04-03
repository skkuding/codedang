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
          등록된 문제
        </TabsTrigger>
        <TabsTrigger
          value="creating"
          variant="problem"
          onClick={() => router.push(`/problem/creating`)}
        >
          제작 중인 문제
        </TabsTrigger>
        <TabsTrigger
          value="my-problem"
          variant="problem"
          onClick={() => router.push(`/problem/my-problem`)}
        >
          내가 만든 문제
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
