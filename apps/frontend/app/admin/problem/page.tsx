'use client'

import FetchErrorFallback from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/shadcn/dialog'
import { ErrorBoundary } from '@suspensive/react'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { ProblemTable, ProblemTableFallback } from './_components/ProblemTable'
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

  return (
    <>
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
              <UploadDialog />
              <Link href="/admin/problem/create">
                <Button variant="default">
                  <PlusCircleIcon className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </Link>
            </div>
          )}
        </div>
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<ProblemTableFallback />}>
            <ProblemTable />
          </Suspense>
        </ErrorBoundary>
      </div>
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
    </>
  )
}
