import { cn } from '@/libs/utils'
import { useQuery } from '@apollo/client'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaUserGroup } from 'react-icons/fa6'

export function GroupLink() {
  const pathname = usePathname()

  // const { data } = useQuery(GET_GROUPS, {
  //   variables: {
  //     cursor: 1,
  //     take: 5
  //   }
  // })
  return (
    <div
      className={cn(
        'flex flex-col gap-2 hover:bg-slate-100',
        pathname.startsWith('/admin/group') && 'bg-slate-100 hover:opacity-95'
      )}
    >
      <Link
        href="/admin/group"
        className={cn(
          'rounded px-4 py-2 transition',
          pathname === '/admin/group'
            ? 'bg-primary text-white hover:opacity-95'
            : 'text-slate-600 hover:bg-slate-200'
        )}
      >
        {<FaUserGroup className="mr-2 inline-block" />}
        Group
      </Link>
      {/* {data?.getGroups.map((group) => (
        <Link
          href={`/admin/group/${group.id}` as const}
          key={group.id}
          className={cn(
            'rounded py-2 pl-8 pr-4 transition',
            pathname.startsWith(`/admin/group/${group.id}`)
              ? 'bg-primary text-white hover:opacity-95'
              : 'text-slate-600 hover:bg-slate-200'
          )}
        >
          {group.groupName}
        </Link>
      ))} */}
    </div>
  )
}
