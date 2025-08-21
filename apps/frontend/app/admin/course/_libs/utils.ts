import type { SemesterSeason } from '@/types/type'

export const semesterItems = () => {
  const currentYear = new Date().getFullYear()
  const seasons: SemesterSeason[] = ['Spring', 'Summer', 'Fall', 'Winter']

  // 현재 월 기준으로 현재 계절 인덱스 구하기
  const month = new Date().getMonth() + 1
  let currentSeasonIdx = 0
  if (month >= 3 && month <= 5) {
    currentSeasonIdx = 0
  } // Spring
  else if (month >= 6 && month <= 8) {
    currentSeasonIdx = 1
  } // Summer
  else if (month >= 9 && month <= 11) {
    currentSeasonIdx = 2
  } // Fall
  else {
    currentSeasonIdx = 3
  } // Winter
  return Array.from({ length: 5 }, (_, i) => {
    const seasonIdx = (currentSeasonIdx + i) % 4
    const yearOffset = Math.floor((currentSeasonIdx + i) / 4)
    return `${currentYear + yearOffset} ${seasons[seasonIdx]}`
  })
}
