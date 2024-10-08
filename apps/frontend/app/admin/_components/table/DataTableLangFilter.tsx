'use client'

import { languages } from '@/lib/constants'
import DataTableMultiSelectFilter from './DataTableMultiSelectFilter'
import { LANG_COLUMN_ID } from './constants'
import { useDataTable } from './context'

/**
 * 어드민 테이블의 Languages 필터 컴포넌트
 * @desciption 컬럼 아이디가 "languages" 여야 합니다.
 */
export default function DataTableLangFilter() {
  const { table } = useDataTable()

  return (
    <DataTableMultiSelectFilter
      column={table.getColumn(LANG_COLUMN_ID)}
      title="Languages"
      options={languages.map((item) => ({ value: item, label: item }))}
    />
  )
}
