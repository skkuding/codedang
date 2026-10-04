'use client'

import { languages, levels } from '@/libs/constants'
import { MultiSelectFilter } from '../../_components/table/MultiSelectFilter'
import { useLangFilter, useLevelFilter } from '../_libs/useFilter'
import type { Languages, Levels } from './FilterProvider'

export function ProblemFilter() {
  const [, setLanguage] = useLangFilter()
  const [, setLevel] = useLevelFilter()

  return (
    <>
      <MultiSelectFilter
        title="Language"
        options={languages.map((item) => ({ value: item, label: item }))}
        onUpdate={(value) => {
          setLanguage(value as Languages)
        }}
      />
      <MultiSelectFilter
        title="Level"
        options={levels.map((item) => ({ value: item, label: item }))}
        onUpdate={(value) => {
          setLevel(value as Levels)
        }}
      />
    </>
  )
}
