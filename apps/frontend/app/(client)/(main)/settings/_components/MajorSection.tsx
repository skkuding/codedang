'use client'

import { allMajors } from '@/libs/constants'
import { cn } from '@/libs/utils'
import { useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
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

  const getInitialDisplay = () => {
    if (majorValue && majorValue !== 'none') {
      return getKoreanMajorName(majorValue)
    }
    if (defaultProfileValues.major && defaultProfileValues.major !== 'none') {
      return getKoreanMajorName(defaultProfileValues.major)
    }
    return ''
  }
  const initialDisplay = getInitialDisplay()

  const [query, setQuery] = useState(initialDisplay)
  const [open, setOpen] = useState(false)

  const filteredMajors =
    query.length > 0
      ? allMajors.filter((m: string) =>
          getKoreanMajorName(m).toLowerCase().includes(query.toLowerCase())
        )
      : []

  if (!isSKKU) {
    return null
  }

  return (
    <div
      className="relative flex flex-col gap-1"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false)
        }
      }}
      tabIndex={-1}
    >
      <label className="text-caption2_m_12 text-color-neutral-15">학과</label>
      <div className="relative">
        <input
          type="text"
          placeholder={isLoading ? 'Loading...' : '학과 검색'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            if (majorValue) {
              setMajorValue('')
            }
          }}
          onFocus={() => setOpen(true)}
          className="focus:border-primary border-line text-body1_m_16 text-color-neutral-30 placeholder:text-color-neutral-90 h-[46px] w-full rounded-xl border bg-white px-5 py-[11px] pr-11 outline-none"
        />
        <IoSearchOutline
          className="text-color-neutral-30 absolute right-4 top-1/2 -translate-y-1/2"
          size={18}
        />
      </div>
      {open && query.length > 0 && (
        <ul className="border-line absolute top-[74px] z-10 max-h-[200px] w-full overflow-y-auto rounded-xl border bg-white shadow-md">
          {filteredMajors.length > 0 ? (
            filteredMajors.map((major: string) => {
              const displayName = getKoreanMajorName(major)
              return (
                <li
                  key={major}
                  tabIndex={0}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setMajorValue(displayName)
                    setQuery(displayName)
                    setOpen(false)
                  }}
                  className={cn(
                    'text-body1_m_16 cursor-pointer px-5 py-[13px] hover:bg-gray-50',
                    majorValue === displayName && 'bg-gray-50'
                  )}
                >
                  {displayName}
                </li>
              )
            })
          ) : (
            <li className="text-body1_m_16 text-color-neutral-70 px-5 py-[13px]">
              검색 결과가 없습니다
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
