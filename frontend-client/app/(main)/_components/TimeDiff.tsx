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
  const [now, setNow] = useState(timeRef)

  useInterval(() => {
    setNow(new Date())
  }, 1000)

  const diff = dayjs.duration(dayjs(timeRef).diff(now))
  const days = Math.floor(diff.asDays())

  return <p>{(days ? `${days}D ` : '') + diff.format('HH:mm:ss')}</p>
}
