'use client'

import { fetcher } from '@/lib/utils'
import type { Contest } from '@/types/type'
import { useEffect, useState } from 'react'
import ContestTable from './_components/ContestTable'

const getFinished = async () => {
  const data = await fetcher<{
    finished: Contest[]
  }>('/contest/finished?take=51')
  data.finished.forEach((contest) => {
    contest.status = 'finished'
  })
  return data.finished
}

export default function Contest() {
  const [finished, setFinished] = useState<Contest[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const data = await getFinished()
      setFinished(data)
    }
    fetchData()
  }, [])

  return (
    <>
      {/* TODO: Add contest card list */}
      <p className="text-xl font-bold md:text-2xl">Finished</p>
      {/* TODO: Add search bar */}
      <ContestTable data={finished} />
    </>
  )
}
