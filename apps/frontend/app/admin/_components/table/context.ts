import type { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'

interface Context<TData> {
  table: Table<TData>
}

/**
 * Table instance를 관리하는 React Context입니다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Context = createContext<Context<any> | undefined>(undefined)
export const Provider = Context.Provider

/**
 * Table instance가 담긴 객체를 반환하는 hook입니다.
 * @throws DataTableRoot의 하위 컴포넌트 내에서 사용하지 않는다면 에러를 던집니다.
 */
export const useDataTable = <TData>() => {
  const context = useContext<Context<TData> | undefined>(Context)

  if (context === undefined) {
    throw new Error('useDataTable should be used within the DataTableRoot')
  }

  return context
}
