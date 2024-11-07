'use client'

import { cn } from '@/lib/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps<T extends string> {
  href: Route<T>
  text: string
}

export default function NavLink<T extends string>({
  href,
  text
}: NavLinkProps<T>) {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      className={cn(
        'text-md hover:text-primary',
        pathname.startsWith(String(href)) && 'text-primary'
      )}
    >
      {text}
    </Link>
  )
}
