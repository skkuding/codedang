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
      <TabsList>
        <TabsTrigger value="published" onClick={() => router.push(`/problem`)}>
          Published
        </TabsTrigger>
        <TabsTrigger
          value="creating"
          onClick={() => router.push(`/problem/creating`)}
        >
          Creating
        </TabsTrigger>
        <TabsTrigger
          value="my-problem"
          onClick={() => router.push(`/problem/my-problem`)}
        >
          My problem
        </TabsTrigger>
      </TabsList>
    </Tabs>

    /*
    <div className="bg-Common-100 outline-Line-Normal flex items-center justify-start rounded-full p-1 outline outline-1 outline-offset-[-0.50px]">
      <div className="bg-Primary-Normal inline-flex w-40 flex-col items-center justify-center gap-2.5 rounded-full py-3">
        <Link
          href={`/problem` as Route}
          className={cn(
            'flex justify-center p-[18px] py-[22.5px] text-lg',
            'whitespace-nowrap',
            isCurrentTab('') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          Published
        </Link>
        <Link
          href={`/problem/creating` as Route}
          className={cn(
            'flex justify-center p-[18px] py-[22.5px] text-lg',
            'whitespace-nowrap',
            isCurrentTab('creating') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          Creating
        </Link>
        <Link
          href={`/problem/my-problems` as Route}
          className={cn(
            'flex justify-center whitespace-nowrap p-[18px] py-[22.5px] text-lg',
            isCurrentTab('my-problems') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          My problems
        </Link>
      </div>
    </div>
    */
  )
}
