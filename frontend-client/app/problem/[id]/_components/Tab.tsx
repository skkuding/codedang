'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  id: number
}

export default function Tab({ id }: Props) {
  // const [tag, setTag] = useState(false) // tag button on/off
  const pathname = usePathname()

  return (
    <div className="border-b border-slate-600 pb-[6px]">
      <Tabs
        defaultValue={
          pathname === `/problem/${id}/submission`
            ? 'Submission'
            : 'Description'
        }
        className="ml-6 mt-1"
      >
        <TabsList className="h-10 bg-slate-800">
          <Link href={`/problem/${id}`}>
            <TabsTrigger
              value="Description"
              className="h-8 data-[state=active]:bg-slate-700 data-[state=active]:text-blue-400"
            >
              Description
            </TabsTrigger>
          </Link>
          <Link href={`/problem/${id}/submission` as Route}>
            <TabsTrigger
              value="Submission"
              className="h-8 data-[state=active]:bg-slate-700 data-[state=active]:text-blue-400"
            >
              Submission
            </TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
    </div>
  )
}
