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
