import { GroupSideBar } from './_components/GroupSideBar'

export default function Layout({
  children,
  params
}: {
  children: React.ReactNode
  params: { groupId: string }
}) {
  const { groupId } = params
  return (
    <div className="flex h-dvh bg-neutral-50">
      <nav className="flex w-40 flex-col bg-white p-2 px-4 pb-6 pt-20 text-sm font-medium">
        <GroupSideBar groupId={groupId} />
      </nav>
      <div className="relative w-[calc(100%-10rem)] overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
