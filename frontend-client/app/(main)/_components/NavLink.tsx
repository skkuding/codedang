'use client'

import { cn } from '@/lib/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps<T extends string> {
  href: Route<T> | URL
  text: string
}

export default function NavLink<T extends string>({
  href,
  text
}: NavLinkProps<T>) {
  const pathname = usePathname()

  return (
    <Link
      href={new URL(href)}
      className={cn(
        'text-lg hover:opacity-60',
        pathname.startsWith(String(href)) && 'text-primary'
      )}
    >
      {text}
    </Link>
  )
}
