import { SearchBar } from '@/app/(client)/(main)/_components/SearchBar'
import information from '@/public/icons/information.svg'
import Image from 'next/image'
import { ContestLeaderboardTable } from './_components/ContestLeaderboardTable'

export default function ContestLeaderBoard() {
  return (
    <>
      <div className="mb-8 flex">
        <h1 className="text-2xl font-semibold leading-8">
          CHECK YOUR RANKING!
        </h1>
        <Image src={information} alt="information" />
      </div>
      {/* NOTE: branch t1205-contest-main-page-new 머지되면 searchbar 디자인 바뀔 예정*/}
      <SearchBar className="mb-12 w-60" />
      <ContestLeaderboardTable />
    </>
  )
}
