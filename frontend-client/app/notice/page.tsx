import Cover from '@/components/Cover'
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { baseUrl } from '@/lib/vars'
import NoticeTable from './_components/NoticeTable'

export default async function Notice({
  searchParams
}: {
  searchParams: { page: string | undefined }
}) {
  // Get data per slot(+ one more page for checking if there is next page) and slice it
  const take = 10
  const currentPage = searchParams.page ? Number(searchParams.page) : 1
  const maxPagesPerSlot = 5
  const currentSlot = Math.floor((currentPage - 1) / maxPagesPerSlot) // if maxPagesPerSlot = 5, slot 0: 1~5, slot 1: 6~10, slot 2: 11~15, ...
  const cursor = currentSlot * take * maxPagesPerSlot
  const data = await fetch(
    baseUrl +
      `/notice?take=${take * (maxPagesPerSlot + 1)}${
        // maxPagesPerSlot + 1: for checking if there is next page
        cursor ? `&cursor=${cursor}` : ''
      }`
  ).then((res) => res.json())
  const currentTotalPages = Math.ceil(data.length / take)
  const currentPageData = data.slice(
    (currentPage - 1 - currentSlot * maxPagesPerSlot) * take,
    (currentPage - currentSlot * maxPagesPerSlot) * take
  )

  const canGoPrevious = currentPage > 1 // if currentPage <= 1, there is no previous page
  const canGoNext =
    currentPage !== currentTotalPages || currentTotalPages > maxPagesPerSlot // if currentPage is last page and currentTotalPages is less than maxPagesPerSlot, there is no next page

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Cover
        title="Notice"
        description="Events and announcements of SKKU Coding Platform"
      />
      <main className="flex w-full max-w-5xl flex-col gap-5 p-5">
        {/* TODO: Add search bar */}
        <NoticeTable data={currentPageData} />
        <Pagination>
          <PaginationContent>
            <PaginationPrevious
              href={canGoPrevious ? `?page=${currentPage - 1}` : undefined}
              className={canGoPrevious ? '' : 'cursor-not-allowed opacity-30'}
            />
            <div className="hidden items-center gap-1 md:flex">
              {[...Array(Math.min(currentTotalPages, maxPagesPerSlot))].map(
                (_, i) => {
                  i = i + currentSlot * maxPagesPerSlot
                  return (
                    <PaginationLink
                      key={i}
                      isActive={currentPage === i + 1}
                      href={`?page=${i + 1}`}
                    >
                      {i + 1}
                    </PaginationLink>
                  )
                }
              )}
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center whitespace-nowrap rounded-md border border-gray-200 bg-white text-sm font-medium ring-offset-white transition-colors  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 md:hidden">
              {currentPage}
            </div>
            <PaginationNext
              href={canGoNext ? `?page=${currentPage + 1}` : undefined}
              className={canGoNext ? '' : 'cursor-not-allowed opacity-30'}
            />
          </PaginationContent>
        </Pagination>
      </main>
    </div>
  )
}
