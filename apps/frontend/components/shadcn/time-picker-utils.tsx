/**
 * regular expression to check for valid hour format (01-23)
 */
export const isValidHour = (value: string) =>
  /^(0[0-9]|1[0-9]|2[0-3])$/.test(value)

/**
 * regular expression to check for valid 12 hour format (01-12)
 */
export const isValid12Hour = (value: string) => /^(0[1-9]|1[0-2])$/.test(value)

/**
 * regular expression to check for valid minute format (00-59)
 */
export const isValidMinuteOrSecond = (value: string) =>
  /^[0-5][0-9]$/.test(value)

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean }

export const getValidNumber = (
  value: string,
  { max, min = 0, loop = false }: GetValidNumberConfig
) => {
  let numericValue = parseInt(value, 10)

  if (!isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max
      if (numericValue < min) numericValue = min
    } else {
      if (numericValue > max) numericValue = min
      if (numericValue < min) numericValue = max
    }
    return numericValue.toString().padStart(2, '0')
  }

  return '00'
}

export const getValidHour = (value: string) => {
  if (isValidHour(value)) return value
  return getValidNumber(value, { max: 23 })
}

export const getValid12Hour = (value: string) => {
  if (isValid12Hour(value)) return value
  return getValidNumber(value, { max: 12 })
}

export const getValidMinuteOrSecond = (value: string) => {
  if (isValidMinuteOrSecond(value)) return value
  return getValidNumber(value, { max: 59 })
}

type GetValidArrowNumberConfig = {
  min: number
  max: number
  step: number
}

export const getValidArrowNumber = (
  value: string,
  { min, max, step }: GetValidArrowNumberConfig
) => {
  let numericValue = parseInt(value, 10)
  if (!isNaN(numericValue)) {
    numericValue += step
    return getValidNumber(String(numericValue), { min, max, loop: true })
  }
  return '00'
}

export const getValidArrowHour = (value: string, step: number) => {
  return getValidArrowNumber(value, { min: 0, max: 23, step })
}

export const getValidArrowMinuteOrSecond = (value: string, step: number) => {
  return getValidArrowNumber(value, { min: 0, max: 59, step })
}

export const setMinutes = (date: Date, value: string) => {
  const minutes = getValidMinuteOrSecond(value)
  date.setMinutes(parseInt(minutes, 10))
  return date
}

export const setSeconds = (date: Date, value: string) => {
  const seconds = getValidMinuteOrSecond(value)
  date.setSeconds(parseInt(seconds, 10))
  return date
}

export const setHours = (date: Date, value: string) => {
  const hours = getValidHour(value)
  date.setHours(parseInt(hours, 10))
  return date
}

export type TimePickerType = 'minutes' | 'seconds' | 'hours' // | "12hours";

export const setDateByType = (
  date: Date,
  value: string,
  type: TimePickerType
) => {
  switch (type) {
    case 'minutes':
      return setMinutes(date, value)
    case 'seconds':
      return setSeconds(date, value)
    case 'hours':
      return setHours(date, value)
    default:
      return date
  }
}

export const getDateByType = (date: Date, type: TimePickerType) => {
  switch (type) {
    case 'minutes':
      return getValidMinuteOrSecond(String(date.getMinutes()))
    case 'seconds':
      return getValidMinuteOrSecond(String(date.getSeconds()))
    case 'hours':
      return getValidHour(String(date.getHours()))
    default:
      return '00'
  }
}

export const getArrowByType = (
  value: string,
  step: number,
  type: TimePickerType
) => {
  switch (type) {
    case 'minutes':
      return getValidArrowMinuteOrSecond(value, step)
    case 'seconds':
      return getValidArrowMinuteOrSecond(value, step)
    case 'hours':
      return getValidArrowHour(value, step)
    default:
      return '00'
  }
}
