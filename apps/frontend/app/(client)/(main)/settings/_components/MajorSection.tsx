'use client'

import { MajorSearchInput } from '@/components/MajorSearchInput'
import { useSettingsContext } from './context'

const getKoreanMajorName = (major: string) =>
  major
    .split(/\s*\/\s*/)
    .at(-1)
    ?.trim() ?? major

export function MajorSection() {
  const {
    isLoading,
    defaultProfileValues,
    majorState: { majorValue, setMajorValue },
    collegeState: { collegeValue }
  } = useSettingsContext()

  const isSKKU = (
    collegeValue ||
    defaultProfileValues.college ||
    ''
  ).startsWith('성균관대학교')

  const effectiveValue =
    (majorValue && majorValue !== 'none'
      ? getKoreanMajorName(majorValue)
      : null) ||
    (defaultProfileValues.major && defaultProfileValues.major !== 'none'
      ? getKoreanMajorName(defaultProfileValues.major)
      : null) ||
    ''

  if (!isSKKU) {
    return null
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-caption2_m_12 text-color-neutral-15">학과</label>
      <MajorSearchInput
        key={effectiveValue}
        value={effectiveValue}
        onChange={setMajorValue}
        placeholder={isLoading ? 'Loading...' : '학과 검색'}
        inputClassName="text-body1_m_16 text-color-neutral-30 placeholder:text-color-neutral-90"
      />
    </div>
  )
}
