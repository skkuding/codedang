'use client'

import { useEffect } from 'react'
import { useDataTable } from '../../_components/table/context'
import { useSearch } from '../_libs/useSearch'

const COLUMN_ID_TITLE = 'title'

export function SearchInputSync() {
  const [search] = useSearch()
  const { table } = useDataTable()

  useEffect(() => {
    table.getColumn(COLUMN_ID_TITLE)?.setFilterValue(search)
    table.setPageIndex(0)
  }, [search, table])

  return null
}
