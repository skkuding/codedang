'use client'

import { Input } from '@/components/shadcn/input'
import InfoIcon from '@/public/icons/file-info-gray.svg'
import SearchIcon from '@/public/icons/search.svg'
import Image from 'next/image'
import { useState } from 'react'

function handleSearch(text: string) {
  alert(`검색할래요 ${text}를.`)
}

export default function ContestLeaderBoard() {
  const [searchText, setSearchText] = useState('')

  return (
    <div>
      <div className="mt-[96px] flex flex-row">
        <div className="h-[34px] text-[24px] font-bold">
          CHECK YOUR RANKING!
        </div>
        <Image
          src={InfoIcon}
          alt="info-icon"
          width={32}
          height={32}
          className="ml-1"
        />
      </div>
      <div className="relative mt-[30px]">
        <Image
          src={SearchIcon}
          alt="search"
          className="absolute left-5 top-1/2 -translate-y-1/2"
          onClick={() => {
            handleSearch(searchText)
          }}
        />
        <Input
          placeholder="Search"
          className="pl-[52px] text-[18px] font-normal"
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchText)
            }
          }}
        />
      </div>
    </div>
  )
}
