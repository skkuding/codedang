'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import Link from 'next/link'
import { FaAngleLeft, FaPencil } from 'react-icons/fa6'

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params

  return (
    <ScrollArea className="shrink-0">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/contest">
              <FaAngleLeft className="h-12 hover:text-gray-700/80" />
            </Link>
            <span className="text-4xl font-bold">{id}</span>
          </div>
          <Link href={`/admin/contest/${id}/edit`}>
            <Button variant="default">
              <FaPencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </main>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
