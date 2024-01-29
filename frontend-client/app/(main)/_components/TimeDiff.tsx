'use client'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useState } from 'react'
import { useInterval } from 'react-use'

dayjs.extend(duration)

interface Props {
  timeRef: Date
}

export default function TimeDiff({ timeRef }: Props) {
  const [now, setNow] = useState(new Date())

  useInterval(() => {
    setNow(new Date())
  }, 1000)

  const diff = dayjs.duration(dayjs(timeRef).diff(now))
  const days = Math.floor(diff.asDays())
  const hours = Math.floor(diff.asHours() % 24)
    .toString()
    .padStart(2, '0')

  return (
    <>
      {days}d {hours + diff.format(':mm:ss')}
    </>
  )
}
