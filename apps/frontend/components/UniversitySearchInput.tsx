'use client'

import { CAMPUS_OVERRIDES, REGION_SHORT } from '@/libs/constants'
import { cn } from '@/libs/utils'
import { searchUniversities } from 'korea-universities'
import { useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'

type University = ReturnType<typeof searchUniversities>[number]

interface UniversitySearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  excludeNames?: string[]
  error?: string
  inputClassName?: string
}

const getDisplayName = (uni: University, allResults: University[]): string => {
  const hasDuplicate =
    allResults.filter((u) => u.nameKr === uni.nameKr).length > 1
  if (!hasDuplicate) {
    return uni.nameKr
  }
  const override = CAMPUS_OVERRIDES[uni.nameKr]?.[uni.campus ?? '']
  if (override) {
    return `${uni.nameKr} ${override}`
  }
  const sameRegion =
    allResults.filter((u) => u.nameKr === uni.nameKr && u.region === uni.region)
      .length > 1
  if (sameRegion) {
    return `${uni.nameKr} ${uni.campus}`
  }
  const short = REGION_SHORT[uni.region] ?? uni.region
  return `${uni.nameKr} ${short}캠퍼스`
}

export function UniversitySearchInput({
  value,
  onChange,
  placeholder = '대학교 검색',
  disabled,
  excludeNames = [],
  error,
  inputClassName
}: UniversitySearchInputProps) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)

  const filtered =
    query.length > 0
      ? searchUniversities(query).filter((uni, idx, arr) => {
          if (excludeNames.includes(uni.nameKr)) {
            return false
          }
          if (CAMPUS_OVERRIDES[uni.nameKr]) {
            return true
          }
          return (
            arr.findIndex(
              (u) => u.nameKr === uni.nameKr && u.region === uni.region
            ) === idx
          )
        })
      : []

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
      <div className="relative">
        <input
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            if (value) {
              onChange('')
            }
          }}
          onFocus={() => setOpen(true)}
          className={cn(
            'focus:border-primary border-line h-[46px] w-full rounded-xl border bg-white px-5 py-[11px] pr-11 outline-none',
            error && 'border-error focus:border-error',
            inputClassName
          )}
        />
        <IoSearchOutline
          className="text-color-neutral-30 absolute right-4 top-1/2 -translate-y-1/2"
          size={18}
        />
      </div>
      {open && query.length > 0 && (
        <ul className="border-line absolute top-[54px] z-10 max-h-[200px] w-full overflow-y-auto rounded-xl border bg-white shadow-md">
          {filtered.length > 0 ? (
            filtered.map((uni) => {
              const displayName = getDisplayName(uni, filtered)
              return (
                <li
                  key={uni.id}
                  tabIndex={0}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(displayName)
                    setQuery(displayName)
                    setOpen(false)
                  }}
                  className={cn(
                    'text-body1_m_16 cursor-pointer px-5 py-[13px] hover:bg-gray-50',
                    value === displayName && 'bg-gray-50'
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
      {error && <p className="text-caption3_r_13 text-color-red-50">{error}</p>}
    </div>
  )
}
