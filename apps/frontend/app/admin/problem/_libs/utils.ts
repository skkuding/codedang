type Invalid = null | undefined | '' | number

export const isInvalid = (value: Invalid) => {
  return value === null || value === undefined || value === '' || isNaN(value)
}
