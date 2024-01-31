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
    <div className="flex h-full items-center border-b border-slate-600 px-6">
      <Tabs
        defaultValue={
          pathname === `/problem/${id}/submission`
            ? 'Submission'
            : 'Description'
        }
      >
        <TabsList className="bg-slate-800">
          <Link href={`/problem/${id}`}>
            <TabsTrigger
              value="Description"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-blue-400"
            >
              Description
            </TabsTrigger>
          </Link>
          <Link href={`/problem/${id}/submission` as Route}>
            <TabsTrigger
              value="Submission"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-blue-400"
            >
              Submission
            </TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
    </div>
  )
}
