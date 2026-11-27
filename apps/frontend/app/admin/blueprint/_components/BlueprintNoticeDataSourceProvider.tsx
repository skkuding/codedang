'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { BlueprintNoticeSource } from '../_libs/noticeTypes'

const NoticeSourceContext = createContext<BlueprintNoticeSource | null>(null)

export function BlueprintNoticeDataSourceProvider({
  source,
  children
}: {
  source: BlueprintNoticeSource
  children: ReactNode
}) {
  return (
    <NoticeSourceContext.Provider value={source}>
      {children}
    </NoticeSourceContext.Provider>
  )
}

export function useBlueprintNoticeDataSource() {
  return useContext(NoticeSourceContext)
}
