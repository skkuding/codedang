import type { Assignment } from '@/types/type'

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

const isActiveOnDate = (
  selectedDate: Date | undefined,
  assignment: Assignment
) => {
  if (!selectedDate) {
    return true
  }
  const selectedStart = startOfDay(selectedDate).getTime()
  const selectedEnd = selectedStart + 86_400_000 - 1
  const startTime = assignment.startTime.getTime()
  const dueTime = assignment.dueTime?.getTime() ?? assignment.endTime.getTime()
  return !(dueTime < selectedStart || startTime > selectedEnd)
}

const isNotExpired = (assignment: Assignment) => {
  const dueTime = (assignment.dueTime ?? assignment.endTime).getTime()
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
