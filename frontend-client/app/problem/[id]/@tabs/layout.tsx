'use client'

import Tab from '../_components/Tab'

export default function Layout({
  children,
  params
}: {
  children: React.ReactNode
  params: { id: number }
}) {
  const { id } = params
  return (
    <>
      <Tab id={id} />
      {children}
    </>
  )
}
