'use client'

import { useEffect } from 'react'
import { TITLE_COLUMN_ID } from '../../_components/table/constants'
import { useDataTable } from '../../_components/table/context'
import { useSearch } from '../_libs/useSearch'

export function SearchInputSync() {
  const [search] = useSearch()
  const { table } = useDataTable()

  useEffect(() => {
    table.getColumn(TITLE_COLUMN_ID)?.setFilterValue(search)
    table.setPageIndex(0)
  }, [search, table])

  return null
}
