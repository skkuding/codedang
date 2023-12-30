'use client'

import { cn } from '@/lib/utils'
import { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLink<T extends string>({
  href,
  text
}: {
  href: Route<T> | URL
  text: string
}) {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      className={cn(
        'text-lg hover:opacity-60',
        pathname.startsWith(String(href)) && 'text-primary'
      )}
    >
      {text}
    </Link>
  )
}
