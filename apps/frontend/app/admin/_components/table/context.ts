import type { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'

interface Context<TData> {
  table: Table<TData>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Context = createContext<Context<any> | undefined>(undefined)
export const Provider = Context.Provider

export const useDataTable = <TData>() => {
  const context = useContext<Context<TData> | undefined>(Context)

  if (context === undefined) {
    throw new Error('useDataTable should be used within the DataTableRoot')
  }

  return context
}
