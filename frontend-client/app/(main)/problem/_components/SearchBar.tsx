'use client'

import { Input } from '@/components/ui/input'
import { baseUrl } from '@/lib/vars'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'

export default function SearchBar() {
  const [searchKeyword, setSearchKeyword] = useState('')
  const router = useRouter()

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
  }

  const handleSearchSubmit = () => {
    const newUrl = new URL('/problem', baseUrl)
    searchKeyword && newUrl.searchParams.set('search', searchKeyword)
    router.push(`?${newUrl.searchParams}`, { scroll: false })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  return (
    <>
      <button onClick={handleSearchSubmit}>
        <FiSearch className="relative left-7 top-2 h-5 w-5 -translate-y-1/2 transform font-bold text-gray-300" />
      </button>
      <Input
        className="max-w-sm border-2 pl-10 font-bold placeholder:font-normal placeholder:text-gray-300"
        placeholder="Keyword..."
        value={searchKeyword}
        onChange={onSearchChange}
        onKeyDown={onKeyDown}
      />
    </>
  )
}
