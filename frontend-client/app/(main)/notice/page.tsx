import { baseUrl } from '@/lib/vars'
import NoticeTable from './_components/NoticeTable'

export default async function Notice({
  searchParams
}: {
  searchParams: { page: string | undefined }
}) {
  /**
   * To utilize cursor-based pagination, we need fetch data per slot, not per page.
   * For example, if we fetch 10 data per page, we need to fetch 50 data per slot(if 5 pages per slot).
   * Additionally, we need to fetch one more page for checking if there is next page.
   * So, we need to fetch 51 data per slot.
   */

  /** The number of data per page */
  const take = 10

  /**
   * The number of pages per slot.
   * Slot is a group of pages.
   *
   * If maxPagesPerSlot = 5, slot 0 = page 1...5, slot 1 = page 6...10
   */
  const maxPagesPerSlot = 5

  /** The current page being shown in UI */
  const currentPage = searchParams.page ? Number(searchParams.page) : 1

  /** The current slot being shown in UI */
  const currentSlot = Math.floor((currentPage - 1) / maxPagesPerSlot)

  const query = new URLSearchParams({
    // Take one more page for checking if there is next page
    take: String(take * maxPagesPerSlot + 1)
  })
  if (currentSlot > 0) {
    // FIXME: Cursor needs to be loaded from the last page of previous slot.
    // Do not manually calculate it.
    query.append('cursor', String(currentSlot * take * maxPagesPerSlot))
  }

  const fixedRes = await fetch(
    baseUrl +
      '/notice?' +
      new URLSearchParams({
        take: '10',
        fixed: 'true'
      })
  )
  const fixedData = await fixedRes.json()

  const res = await fetch(baseUrl + '/notice?' + query)
  const data = await res.json()

  // const currentTotalPages = Math.ceil(data.length / take)
  const currentPageData = fixedData

  currentPageData.push(
    ...data.slice(
      (currentPage - 1 - currentSlot * maxPagesPerSlot) * take,
      (currentPage - currentSlot * maxPagesPerSlot) * take
    )
  )

  // const canGoPrevious = currentSlot > 0
  // const canGoNext = currentTotalPages > maxPagesPerSlot

  // const previousSlotPage = (currentSlot - 1) * maxPagesPerSlot + 1
  // const nextSlotPage = (currentSlot + 1) * maxPagesPerSlot + 1

  return (
    <>
      {/* TODO: Add search bar */}
      <NoticeTable data={currentPageData} currentPage={currentPage} />
    </>
  )
}
