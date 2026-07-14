import type { WorkItem } from './types'

const startOfDay = (date: Date) => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

const todayAtMidnight = () => startOfDay(new Date())

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const isActiveOnDate = (selectedDate: Date | undefined, workItem: WorkItem) => {
  if (!selectedDate) {
    return true
  }
  const selectedStart = startOfDay(selectedDate).getTime()
  const selectedEnd = selectedStart + 86_400_000 - 1
  const startTime = workItem.startTime.getTime()
  const dueTime = workItem.dueTime?.getTime() ?? workItem.endTime.getTime()
  return !(dueTime < selectedStart || startTime > selectedEnd)
}

const isNotExpired = (workItem: WorkItem) => {
  const dueTime = (workItem.dueTime ?? workItem.endTime).getTime()
  return dueTime >= Date.now()
}

const isDueToday = (selectedDate?: Date, dueDate?: Date) =>
  Boolean(selectedDate && dueDate && isSameDay(selectedDate, dueDate))

export {
  isActiveOnDate,
  isDueToday,
  isNotExpired,
  isSameDay,
  startOfDay,
  todayAtMidnight
}
