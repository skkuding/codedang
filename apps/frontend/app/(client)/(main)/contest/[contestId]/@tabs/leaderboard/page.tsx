'use client'

import { Input } from '@/components/shadcn/input'
import InfoIcon from '@/public/icons/file-info-gray.svg'
import SearchIcon from '@/public/icons/search.svg'
import Image from 'next/image'
import { useState } from 'react'
import { LeaderboardTable } from './_components/LeaderboardTable'
import { handleSearch, showScoringCriteria } from './_libs/utils'

export default function ContestLeaderBoard() {
  const [searchText, setSearchText] = useState('')

  return (
    <div className="ml-[116px] w-screen pb-[120px]">
      <div className="mt-[96px] flex flex-row">
        <div className="h-[34px] text-[24px] font-bold">
          CHECK YOUR RANKING!
        </div>
        <Image
          src={InfoIcon}
          alt="info-icon"
          width={32}
          height={32}
          className="ml-1 cursor-pointer"
          onClick={() => {
            showScoringCriteria()
          }}
        />
      </div>
      <div className="relative mb-[62px] mt-[30px]">
        <Image
          src={SearchIcon}
          alt="search"
          className="absolute left-5 top-1/2 -translate-y-1/2 cursor-pointer"
          onClick={() => {
            handleSearch(searchText)
          }}
        />
        <Input
          placeholder="Search"
          className="w-[600px] pl-[52px] text-[18px] font-normal"
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchText)
            }
          }}
        />
      </div>
      <div className="">
        <LeaderboardTable />
      </div>
    </div>
  )
}
