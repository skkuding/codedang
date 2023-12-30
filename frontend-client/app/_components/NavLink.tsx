'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  text: string
}

export default function NavLink({ href, text }: NavLinkProps) {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      className={cn(
        'text-lg hover:opacity-60',
        pathname.startsWith(href) && 'text-primary'
      )}
    >
      {text}
    </Link>
  )
}
