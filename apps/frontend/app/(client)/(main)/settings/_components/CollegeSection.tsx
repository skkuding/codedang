'use client'

import { UniversitySearchInput } from '@/components/UniversitySearchInput'
import { useSettingsContext } from './context'

export function CollegeSection() {
  const {
    isLoading,
    defaultProfileValues,
    collegeState: { collegeValue, setCollegeValue },
    majorState: { setMajorValue }
  } = useSettingsContext()

  const effectiveValue =
    (collegeValue && collegeValue !== 'none' ? collegeValue : null) ||
    (defaultProfileValues.college && defaultProfileValues.college !== 'none'
      ? defaultProfileValues.college
      : null) ||
    ''

  return (
    <div className="flex flex-col gap-1">
      <label className="text-caption2_m_12 text-color-neutral-15">대학교</label>
      <UniversitySearchInput
        key={effectiveValue}
        value={effectiveValue}
        onChange={(v) => {
          setCollegeValue(v)
          setMajorValue('')
        }}
        excludeNames={['성균관대학교']}
        placeholder={isLoading ? 'Loading...' : '대학교 검색'}
        inputClassName="text-body1_m_16 text-color-neutral-30 placeholder:text-color-neutral-90"
      />
    </div>
  )
}
