import { useEffect } from 'react'
import {
  LANG_COLUMN_ID,
  LEVEL_COLUMN_ID
} from '../../_components/table/constants'
import { useDataTable } from '../../_components/table/context'
import { useLangFilter, useLevelFilter } from '../_libs/useFilter'

export function ProblemFilterSync() {
  const [language] = useLangFilter()
  const [level] = useLevelFilter()

  const { table } = useDataTable()

  useEffect(() => {
    table
      .getColumn(LANG_COLUMN_ID)
      ?.setFilterValue(language.length ? language : undefined)
    table.resetPageIndex()
  }, [language, table])

  useEffect(() => {
    table
      .getColumn(LEVEL_COLUMN_ID)
      ?.setFilterValue(level.length ? level : undefined)
    table.resetPageIndex()
  }, [level, table])

  return null
}
