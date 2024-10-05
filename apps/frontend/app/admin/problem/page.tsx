'use client'

import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useQuery } from '@apollo/client'
import { Language, Level } from '@generated/graphql'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { columns } from './_components/Columns'
import UploadDialog from './_components/UploadDialog'

export default function Page({
  searchParams
}: {
  searchParams: { import: boolean | undefined }
}) {
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  useEffect(() => {
    if (searchParams.import) {
      setOpenDialog(true)
    }
  }, [searchParams.import])

  const importProblem = searchParams.import
  const { data, loading, refetch } = useQuery(GET_PROBLEMS, {
    variables: {
      groupId: 1,
      take: 500,
      input: {
        difficulty: [
          Level.Level1,
          Level.Level2,
          Level.Level3,
          Level.Level4,
          Level.Level5
        ],
        languages: [Language.C, Language.Cpp, Language.Java, Language.Python3]
      }
    }
  })

  const problems =
    data?.getProblems.map((problem) => ({
      ...problem,
      id: Number(problem.id),
      isVisible: problem.isVisible !== undefined ? problem.isVisible : null,
      languages: problem.languages ?? [],
      tag: problem.tag.map(({ id, tag }) => ({
        id: +id,
        tag: {
          ...tag,
          id: +tag.id
        }
      }))
    })) ?? []

  return (
    <ScrollArea className="shrink-0">
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="p-8">
          <DialogHeader className="gap-2">
            <DialogTitle>Import problem list</DialogTitle>
            <DialogDescription>
              When importing problems from the problem list to the contest,
              selected problems is automatically set to &apos;not visible.&apos;
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" className="bg-black hover:bg-black/70">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="container mx-auto space-y-5 py-10">
        <div className="flex justify-between">
          <div>
            <p className="text-4xl font-bold">Problem List</p>
            <p className="flex text-lg text-slate-500">
              Here&apos;s a list you made
            </p>
          </div>
          {importProblem ? null : (
            <div className="flex gap-2">
              <UploadDialog refetch={refetch} />
              <Link href="/admin/problem/create">
                <Button variant="default">
                  <PlusCircleIcon className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </Link>
            </div>
          )}
        </div>
        {loading ? (
          <>
            <div className="mb-16 flex gap-4">
              <span className="w-2/12">
                <Skeleton className="h-10 w-full" />
              </span>
              <span className="w-1/12">
                <Skeleton className="h-10 w-full" />
              </span>
              <span className="w-1/12">
                <Skeleton className="h-10 w-full" />
              </span>
            </div>
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="my-2 flex h-12 w-full rounded-xl" />
            ))}
          </>
        ) : (
          <DataTableAdmin
            columns={columns}
            data={problems}
            enableSearch={true}
            enableFilter={true}
            enableDelete={true}
            enablePagination={true}
            defaultSortColumn={{ id: 'updateTime', desc: true }}
          />
        )}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
