'use client'

import { levels } from '@/libs/constants'
import { DataTableMultiSelectFilter } from './DataTableMultiSelectFilter'
import { LEVEL_COLUMN_ID } from './constants'
import { useDataTable } from './context'

/**
 * 어드민 테이블의 Difficulty(Level) 필터
 * @desciption 컬럼 아이디가 "difficulty" 여야 합니다.
 */
export function DataTableLevelFilter() {
  const { table } = useDataTable()

  return (
    <DataTableMultiSelectFilter
      column={table.getColumn(LEVEL_COLUMN_ID)}
      title="Level"
      options={levels.map((item) => ({
        value: item,
        label: `Level ${item.slice(-1)}`
      }))}
    />
  )
}
