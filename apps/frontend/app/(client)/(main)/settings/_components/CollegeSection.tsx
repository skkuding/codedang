'use client'

import { cn } from '@/libs/utils'
import { searchUniversities } from 'korea-universities'
import { useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import { useSettingsContext } from './context'

type University = ReturnType<typeof searchUniversities>[number]

const CAMPUS_OVERRIDES: Record<string, Record<string, string>> = {
  성균관대학교: { 제1캠퍼스: '서울캠퍼스', 제2캠퍼스: '수원캠퍼스' },
  연세대학교: { 제1캠퍼스: '신촌캠퍼스', 제2캠퍼스: '국제캠퍼스' },
  경희대학교: { 제1캠퍼스: '서울캠퍼스', 제2캠퍼스: '국제캠퍼스' },
  중앙대학교: { 제1캠퍼스: '서울캠퍼스', 제2캠퍼스: '안성캠퍼스' },
  한국외국어대학교: { 제1캠퍼스: '서울캠퍼스', 제2캠퍼스: '글로벌캠퍼스' },
  단국대학교: { 제1캠퍼스: '죽전캠퍼스', 제2캠퍼스: '천안캠퍼스' },
  부산대학교: {
    제1캠퍼스: '부산캠퍼스',
    제2캠퍼스: '밀양캠퍼스',
    제3캠퍼스: '양산캠퍼스'
  },
  강원대학교: { 제1캠퍼스: '춘천캠퍼스', 제2캠퍼스: '삼척캠퍼스' }
}

const REGION_SHORT: Record<string, string> = {
  서울특별시: '서울',
  경기도: '경기',
  인천광역시: '인천',
  부산광역시: '부산',
  대구광역시: '대구',
  광주광역시: '광주',
  대전광역시: '대전',
  울산광역시: '울산',
  세종특별자치시: '세종',
  강원특별자치도: '강원',
  충청북도: '충북',
  충청남도: '충남',
  전라남도: '전남',
  전북특별자치도: '전북',
  경상북도: '경북',
  경상남도: '경남',
  제주특별자치도: '제주'
}

export function CollegeSection() {
  const {
    isLoading,
    defaultProfileValues,
    collegeState: { collegeValue, setCollegeValue },
    majorState: { setMajorValue }
  } = useSettingsContext()

  const getInitialDisplay = () => {
    if (collegeValue && collegeValue !== 'none') {
      return collegeValue
    }
    if (
      defaultProfileValues.college &&
      defaultProfileValues.college !== 'none'
    ) {
      return defaultProfileValues.college
    }
    return ''
  }
  const initialDisplay = getInitialDisplay()

  const [query, setQuery] = useState(initialDisplay)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!query && collegeValue && collegeValue !== 'none') {
      setQuery(collegeValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collegeValue])

  const rawUniversities: University[] =
    query.length > 0 ? searchUniversities(query) : []

  const filteredUniversities = rawUniversities.filter((uni, idx, arr) => {
    if (uni.nameKr === '성균관대학교') {
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

  const getDisplayName = (uni: University): string => {
    const hasDuplicate =
      filteredUniversities.filter((u: University) => u.nameKr === uni.nameKr)
        .length > 1
    if (!hasDuplicate) {
      return uni.nameKr
    }
    const override = CAMPUS_OVERRIDES[uni.nameKr]?.[uni.campus ?? '']
    if (override) {
      return `${uni.nameKr} ${override}`
    }
    const sameRegion =
      filteredUniversities.filter(
        (u: University) => u.nameKr === uni.nameKr && u.region === uni.region
      ).length > 1
    if (sameRegion) {
      return `${uni.nameKr} ${uni.campus}`
    }
    const short = REGION_SHORT[uni.region] ?? uni.region
    return `${uni.nameKr} ${short}캠퍼스`
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
      <label className="text-caption2_m_12 text-color-neutral-15">대학교</label>
      <div className="relative">
        <input
          placeholder={isLoading ? 'Loading...' : '대학교 검색'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            if (collegeValue) {
              setCollegeValue('')
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
          {filteredUniversities.length > 0 ? (
            filteredUniversities.map((uni: University) => {
              const displayName = getDisplayName(uni)
              return (
                <li
                  key={uni.id}
                  tabIndex={0}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setCollegeValue(displayName)
                    setMajorValue('')
                    setQuery(displayName)
                    setOpen(false)
                  }}
                  className={cn(
                    'text-body1_m_16 cursor-pointer px-5 py-[13px] hover:bg-gray-50',
                    collegeValue === displayName && 'bg-gray-50'
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
