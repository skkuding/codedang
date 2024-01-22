import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import type { Standings } from '@/types/type'
import StandingsTable from '../../../_components/StandingsTable'

const dummyData: Standings[] = [
  {
    ranking: 1,
    userId: 2020312942,
    problemScore: [
      { problemId: 1, score: 1127, time: '04:45' },
      { problemId: 2, score: 1062, time: '06:02' },
      { problemId: 3, score: 996, time: '03:25' },
      { problemId: 4, score: 931, time: '02:58' },
      { problemId: 5, score: 866, time: '03:45' },
      { problemId: 6, score: 800, time: '01:30' },
      { problemId: 7, score: 735, time: '02:15' },
      { problemId: 8, score: 670, time: '04:00' }
    ],
    solved: 8,
    totalScore: 8191
  },
  {
    ranking: 2,
    userId: 2020312945,
    problemScore: [
      { problemId: 1, score: 1149, time: '04:22' },
      { problemId: 2, score: 1084, time: '06:40' },
      { problemId: 3, score: 1019, time: '04:05' },
      { problemId: 4, score: 954, time: '02:30' },
      { problemId: 5, score: 889, time: '03:45' },
      { problemId: 6, score: 823, time: '01:58' },
      { problemId: 7, score: 758, time: '03:30' },
      { problemId: 8, score: 693, time: '02:10' }
    ],
    solved: 8,
    totalScore: 8180
  },
  {
    ranking: 3,
    userId: 2020312938,
    problemScore: [
      { problemId: 1, score: 1184, time: '03:15' },
      { problemId: 2, score: 1093, time: '05:22' },
      { problemId: 3, score: 1014, time: '02:45' },
      { problemId: 4, score: 949, time: '01:30' },
      { problemId: 5, score: 875, time: '02:40' },
      { problemId: 6, score: 770, time: '04:10' },
      { problemId: 7, score: 715, time: '03:00' },
      { problemId: 8, score: 660, time: '02:15' }
    ],
    solved: 8,
    totalScore: 8000
  },
  {
    ranking: 4,
    userId: 2020312939,
    problemScore: [
      { problemId: 1, score: 1093, time: '04:10' },
      { problemId: 2, score: 1014, time: '06:30' },
      { problemId: 3, score: 949, time: '03:55' },
      { problemId: 4, score: 875, time: '02:10' },
      { problemId: 5, score: 810, time: '04:45' },
      { problemId: 6, score: 754, time: '01:58' },
      { problemId: 7, score: 660, time: '03:30' },
      { problemId: 8, score: 605, time: '02:00' }
    ],
    solved: 8,
    totalScore: 7650
  },
  {
    ranking: 5,
    userId: 2020312940,
    problemScore: [
      { problemId: 1, score: 1014, time: '02:30' },
      { problemId: 2, score: 949, time: '04:45' },
      { problemId: 3, score: 875, time: '01:58' },
      { problemId: 4, score: 810, time: '03:40' },
      { problemId: 5, score: 754, time: '02:15' },
      { problemId: 6, score: 698, time: '02:22' },
      { problemId: 7, score: 605, time: '03:15' },
      { problemId: 8, score: 550, time: '04:00' }
    ],
    solved: 8,
    totalScore: 7650
  },
  {
    ranking: 6,
    userId: 2020312944,
    problemScore: [
      { problemId: 1, score: 1071, time: '03:30' },
      { problemId: 2, score: 1006, time: '05:55' },
      { problemId: 3, score: 941, time: '02:12' },
      { problemId: 4, score: 876, time: '04:05' },
      { problemId: 5, score: 810, time: '01:50' },
      { problemId: 6, score: 745, time: '03:00' },
      { problemId: 7, score: 680, time: '02:25' },
      { problemId: 8, score: 615, time: '01:35' }
    ],
    solved: 8,
    totalScore: 7644
  },
  {
    ranking: 7,
    userId: 2020312947,
    problemScore: [
      { problemId: 1, score: 1035, time: '03:40' },
      { problemId: 2, score: 970, time: '06:15' },
      { problemId: 3, score: 905, time: '03:02' },
      { problemId: 4, score: 840, time: '02:25' },
      { problemId: 5, score: 775, time: '03:35' },
      { problemId: 6, score: 710, time: '01:40' },
      { problemId: 7, score: 645, time: '04:10' },
      { problemId: 8, score: 580, time: '02:50' }
    ],
    solved: 8,
    totalScore: 7095
  },
  {
    ranking: 8,
    userId: 2020312941,
    problemScore: [
      { problemId: 1, score: 949, time: '03:50' },
      { problemId: 2, score: 875, time: '05:15' },
      { problemId: 3, score: 810, time: '02:22' },
      { problemId: 4, score: 754, time: '01:45' },
      { problemId: 5, score: 698, time: '03:10' },
      { problemId: 6, score: 643, time: '04:30' },
      { problemId: 7, score: 550, time: '02:40' },
      { problemId: 8, score: 495, time: '03:55' }
    ],
    solved: 8,
    totalScore: 6600
  },
  {
    ranking: 9,
    userId: 2020312946,
    problemScore: [
      { problemId: 1, score: 966, time: '02:40' },
      { problemId: 2, score: 901, time: '05:05' },
      { problemId: 3, score: 836, time: '02:18' },
      { problemId: 4, score: 771, time: '03:12' },
      { problemId: 5, score: 706, time: '02:40' },
      { problemId: 6, score: 641, time: '04:20' },
      { problemId: 7, score: 576, time: '02:55' },
      { problemId: 8, score: 511, time: '03:40' }
    ],
    solved: 8,
    totalScore: 6542
  },
  {
    ranking: 10,
    userId: 2020312943,
    problemScore: [
      { problemId: 1, score: 787, time: '02:15' },
      { problemId: 2, score: 721, time: '04:30' },
      { problemId: 3, score: 656, time: '01:45' },
      { problemId: 4, score: 591, time: '03:20' },
      { problemId: 5, score: 526, time: '02:55' },
      { problemId: 6, score: 460, time: '02:10' },
      { problemId: 7, score: 395, time: '03:35' },
      { problemId: 8, score: 330, time: '04:20' }
    ],
    solved: 8,
    totalScore: 4810
  },

  {
    ranking: 11,
    userId: 2020312950,
    problemScore: [
      { problemId: 1, score: 725, time: '03:10' },
      { problemId: 2, score: 660, time: '04:35' },
      { problemId: 3, score: 595, time: '02:00' },
      { problemId: 4, score: 530, time: '03:25' },
      { problemId: 5, score: 465, time: '02:50' },
      { problemId: 6, score: 400, time: '03:15' },
      { problemId: 7, score: 335, time: '04:00' },
      { problemId: 8, score: 270, time: '04:45' }
    ],
    solved: 8,
    totalScore: 3940
  },
  {
    ranking: 12,
    userId: 2020312951,
    problemScore: [
      { problemId: 1, score: 663, time: '02:55' },
      { problemId: 2, score: 598, time: '04:20' },
      { problemId: 3, score: 533, time: '01:45' },
      { problemId: 4, score: 468, time: '03:30' },
      { problemId: 5, score: 403, time: '02:55' },
      { problemId: 6, score: 338, time: '02:10' },
      { problemId: 7, score: 273, time: '03:35' },
      { problemId: 8, score: 208, time: '04:20' }
    ],
    solved: 8,
    totalScore: 3633
  },
  {
    ranking: 13,
    userId: 2020312952,
    problemScore: [
      { problemId: 1, score: 601, time: '03:20' },
      { problemId: 2, score: 536, time: '04:45' },
      { problemId: 3, score: 471, time: '02:10' },
      { problemId: 4, score: 406, time: '03:45' },
      { problemId: 5, score: 341, time: '02:15' },
      { problemId: 6, score: 276, time: '03:00' },
      { problemId: 7, score: 211, time: '04:35' },
      { problemId: 8, score: 146, time: '05:10' }
    ],
    solved: 8,
    totalScore: 3328
  },
  {
    ranking: 14,
    userId: 2020312953,
    problemScore: [
      { problemId: 1, score: 539, time: '02:40' },
      { problemId: 2, score: 474, time: '04:05' },
      { problemId: 3, score: 409, time: '01:30' },
      { problemId: 4, score: 344, time: '03:55' },
      { problemId: 5, score: 279, time: '02:20' },
      { problemId: 6, score: 214, time: '03:45' },
      { problemId: 7, score: 149, time: '04:30' },
      { problemId: 8, score: 84, time: '05:05' }
    ],
    solved: 8,
    totalScore: 3022
  },
  {
    ranking: 15,
    userId: 2020312954,
    problemScore: [
      { problemId: 1, score: 477, time: '02:25' },
      { problemId: 2, score: 412, time: '04:50' },
      { problemId: 3, score: 347, time: '02:15' },
      { problemId: 4, score: 282, time: '03:40' },
      { problemId: 5, score: 217, time: '02:05' },
      { problemId: 6, score: 152, time: '03:30' },
      { problemId: 7, score: 87, time: '04:05' },
      { problemId: 8, score: 22, time: '05:20' }
    ],
    solved: 8,
    totalScore: 2712
  },
  {
    ranking: 16,
    userId: 2020312955,
    problemScore: [
      { problemId: 1, score: 415, time: '02:10' },
      { problemId: 2, score: 350, time: '05:15' },
      { problemId: 3, score: 285, time: '02:40' },
      { problemId: 4, score: 220, time: '03:15' },
      { problemId: 5, score: 155, time: '01:50' },
      { problemId: 6, score: 90, time: '03:00' },
      { problemId: 7, score: 25, time: '04:25' },
      { problemId: 8, score: 20, time: '05:50' }
    ],
    solved: 8,
    totalScore: 2405
  },
  {
    ranking: 17,
    userId: 2020312956,
    problemScore: [
      { problemId: 1, score: 353, time: '03:35' },
      { problemId: 2, score: 288, time: '05:40' },
      { problemId: 3, score: 223, time: '03:05' },
      { problemId: 4, score: 158, time: '02:30' },
      { problemId: 5, score: 93, time: '03:25' },
      { problemId: 6, score: 28, time: '04:50' },
      { problemId: 7, score: 33, time: '05:15' },
      { problemId: 8, score: 38, time: '06:10' }
    ],
    solved: 8,
    totalScore: 2096
  },
  {
    ranking: 18,
    userId: 2020312957,
    problemScore: [
      { problemId: 1, score: 291, time: '03:50' },
      { problemId: 2, score: 226, time: '06:05' },
      { problemId: 3, score: 161, time: '03:30' },
      { problemId: 4, score: 96, time: '02:55' },
      { problemId: 5, score: 31, time: '03:50' },
      { problemId: 6, score: 36, time: '04:15' },
      { problemId: 7, score: 41, time: '04:40' },
      { problemId: 8, score: 46, time: '05:05' }
    ],
    solved: 8,
    totalScore: 1796
  },
  {
    ranking: 19,
    userId: 2020312958,
    problemScore: [
      { problemId: 1, score: 229, time: '04:05' },
      { problemId: 2, score: 164, time: '06:30' },
      { problemId: 3, score: 99, time: '03:55' },
      { problemId: 4, score: 34, time: '03:20' },
      { problemId: 5, score: 39, time: '03:45' },
      { problemId: 6, score: 44, time: '04:10' },
      { problemId: 7, score: 49, time: '04:35' },
      { problemId: 8, score: 54, time: '05:00' }
    ],
    solved: 8,
    totalScore: 1494
  },
  {
    ranking: 20,
    userId: 2020312959,
    problemScore: [
      { problemId: 1, score: 167, time: '04:20' },
      { problemId: 2, score: 102, time: '06:55' },
      { problemId: 3, score: 37, time: '04:20' },
      { problemId: 4, score: 42, time: '04:45' },
      { problemId: 5, score: 47, time: '05:10' },
      { problemId: 6, score: 52, time: '05:35' },
      { problemId: 7, score: 57, time: '06:00' },
      { problemId: 8, score: 62, time: '06:25' }
    ],
    solved: 8,
    totalScore: 1192
  },
  {
    ranking: 21,
    userId: 2020312960,
    problemScore: [
      { problemId: 1, score: 167, time: '04:20' },
      { problemId: 2, score: 102, time: '06:55' },
      { problemId: 3, score: 37, time: '04:20' },
      { problemId: 4, score: 42, time: '04:45' },
      { problemId: 5, score: 47, time: '05:10' },
      { problemId: 6, score: 52, time: '05:35' },
      { problemId: 7, score: 57, time: '06:00' },
      { problemId: 8, score: 0, time: '' }
    ],
    solved: 7,
    totalScore: 1130
  }
]

export const myUserId = 2020312938

const myRecord: Standings | undefined = dummyData.find(
  (data) => data.userId === myUserId
)

export default function ContestStandings({
  searchParams
}: {
  searchParams: { page: string | undefined }
}) {
  const take = 10
  const currentPage = searchParams.page ? Number(searchParams.page) : 1
  const maxPagesPerSlot = 5
  const currentSlot = Math.floor((currentPage - 1) / maxPagesPerSlot)
  // const cursor = currentSlot * take * maxPagesPerSlot
  const currentTotalPages = Math.ceil(dummyData.length / take)
  const currentPageData = dummyData.slice(
    (currentPage - 1 - currentSlot * maxPagesPerSlot) * take,
    (currentPage - currentSlot * maxPagesPerSlot) * take
  )
  let data: Standings[]
  if (myRecord) {
    data = [myRecord, ...currentPageData]
  } else {
    data = currentPageData
  }

  const canGoPrevious = currentPage > 1 // if currentPage <= 1, there is no previous page
  const canGoNext =
    currentPage !== currentTotalPages || currentTotalPages > maxPagesPerSlot // if currentPage is last page and currentTotalPages is less than maxPagesPerSlot, there is no next page

  return (
    <>
      <StandingsTable data={data} theme="light" />
      <div className="justify-end">
        <Pagination>
          <PaginationContent>
            <PaginationPrevious
              // href={canGoPrevious ? `?page=${currentPage - 1}` : undefined}
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
            <div className="inline-flex h-10 w-10 items-center justify-center whitespace-nowrap rounded-md border border-gray-200 bg-white text-sm font-medium ring-offset-white transition-colors  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:hidden dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300">
              {currentPage}
            </div>
            <PaginationNext
              // href={canGoNext ? `?page=${currentPage + 1}` : undefined}
              className={canGoNext ? '' : 'cursor-not-allowed opacity-30'}
            />
          </PaginationContent>
        </Pagination>
      </div>
    </>
  )
}
