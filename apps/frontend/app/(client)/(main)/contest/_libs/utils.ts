/**
 *
 * @param status status of the contest
 * @returns text for the status
 */
export const getStatusText = (status: string): string => {
  if (status.toLowerCase().includes('ongoing')) {
    return 'Ongoing'
  } else if (status.toLowerCase().includes('upcoming')) {
    return 'Upcoming'
  } else {
    return 'Finished'
  }
}

/**
 *
 * @param status status of the contest
 * @returns text style for the status
 */
export const getStatusColor = (status: string): string => {
  if (status.toLowerCase().includes('upcoming')) {
    return 'text-white border-primary bg-primary font-medium'
  } else if (status.toLowerCase().includes('ongoing')) {
    return 'text-primary border-primary font-medium'
  } else {
    return 'text-[#8A8A8A] border-[#C4C4C4]'
  }
}
