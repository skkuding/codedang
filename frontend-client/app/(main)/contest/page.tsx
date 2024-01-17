'use client'

import { fetcher } from '@/lib/utils'
import type { Contest } from '@/types/type'
import { useEffect, useState } from 'react'
import ContestCardList from '../_components/ContestCardList'
import ContestTable from './_components/ContestTable'

const getFinished = async () => {
  const data: {
    finished: Contest[]
  } = await fetcher.get('contest/finished?take=51').json()
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
      <ContestCardList type={'Ongoing'} />

      <p className="text-xl font-bold md:text-2xl">Finished</p>
      {/* TODO: Add search bar */}
      <ContestTable data={finished} />
    </>
  )
}
