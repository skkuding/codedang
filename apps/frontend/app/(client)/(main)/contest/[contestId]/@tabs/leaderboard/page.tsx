import { SearchBar } from '@/app/(client)/(main)/_components/SearchBar'
import { LeaderboardTable } from './_components/LeaderboardTable'
import { RankInfoDialog } from './_components/RankInfoDialog'

export default function ContestLeaderBoard({
  searchParams,
  params
}: {
  searchParams: { search: string }
  params: { contestId: string }
}) {
  const search = searchParams.search
  const { contestId } = params

  return (
    <>
      <div className="mb-8 flex">
        <h1 className="text-2xl font-semibold leading-8">
          CHECK YOUR RANKING!
        </h1>
        <RankInfoDialog />
      </div>
      {/* NOTE: branch t1205-contest-main-page-new 머지되면 searchbar 디자인 바뀔 예정*/}
      <SearchBar className="mb-12 w-60" />
      <LeaderboardTable contestId={contestId} search={search} />
    </>
  )
}
