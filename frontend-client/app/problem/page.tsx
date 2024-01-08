'use client'

import Paginator from '@/components/Paginator'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { usePagination } from '@/lib/usePagination'
import { baseUrl } from '@/lib/vars'
import type { Problem } from '@/types/type'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import ProblemTable from './_components/ProblemTable'

export default function Page() {
  const searchParams = useSearchParams()
  const [url, setUrl] = useState<URL>(
    new URL(`/problem?search=${searchParams.get('search')}`, baseUrl)
  )
  const { items, paginator } = usePagination<Problem>(url)

  const [isTagChecked, setIsTagChecked] = useState(false)

  const [search, setSearch] = useState('')
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const router = useRouter()
  const handleSearchSubmit = () => {
    const url = new URL('/problem', baseUrl)
    search && url.searchParams.set('search', search)
    router.replace(`?${url.searchParams}`, { scroll: false })
    setUrl(url)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const problems = items ?? []
  return (
    <>
      <div className="flex text-gray-500">
        <div className="flex flex-1 items-center gap-1 text-xl font-extrabold">
          All
          <p className="text-primary">{problems.length}</p>
        </div>
        <div className="flex items-center gap-1">
          <Switch
            onClick={() => {
              setIsTagChecked(!isTagChecked)
            }}
          />
          <p className="font-bold"> Tags</p>
          <div className="flex items-center py-4">
            <button onClick={handleSearchSubmit}>
              <FiSearch className="relative left-7 top-2 h-5 w-5 -translate-y-1/2 transform font-bold text-gray-300" />
            </button>
            <Input
              className="max-w-sm border-2 pl-10 font-bold placeholder:font-normal placeholder:text-gray-300"
              placeholder="Keyword..."
              value={search}
              onChange={onSearchChange}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>
      </div>
      <ProblemTable
        data={problems}
        isLoading={!items}
        isTagChecked={isTagChecked}
      />
      <Paginator page={paginator.page} slot={paginator.slot} setUrl={setUrl} />
    </>
  )
}
