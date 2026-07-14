import { useState } from 'react'
import { isSameDay, startOfDay, todayAtMidnight } from './utils'

const useDashboardCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    todayAtMidnight()
  )
  const [viewMonth, setViewMonth] = useState(() => {
    const initialDate = selectedDate ?? todayAtMidnight()
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  })

  const onSelectDate = (nextDate: Date | undefined) => {
    const today = todayAtMidnight()
    if (!nextDate) {
      setSelectedDate(today)
      setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1))
      return
    }

    const normalizedDate = startOfDay(nextDate)
    if (selectedDate && isSameDay(selectedDate, normalizedDate)) {
      setSelectedDate(today)
      setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1))
      return
    }

    setSelectedDate(normalizedDate)
    setViewMonth(
      new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), 1)
    )
  }

  return { onSelectDate, selectedDate, setViewMonth, viewMonth }
}

export { useDashboardCalendar }
