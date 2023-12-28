'use client'

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
      className={`text-lg hover:opacity-60 ${
        pathname === href ? 'text-primary' : ''
      }`}
    >
      {text}
    </Link>
  )
}
