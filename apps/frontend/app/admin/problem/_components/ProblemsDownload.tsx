'use client'

import { Button } from '@/components/shadcn/button'
import { usePathname } from 'next/navigation'
import { FiDownload } from 'react-icons/fi'

type Mode = 'my' | 'shared'

const API_BASE = process.env.NEXT_PUBLIC_BASEURL ?? ''

export function ProblemsDownload() {
  const pathname = usePathname()

  const mode: Mode = pathname.startsWith('/admin/problem/shared')
    ? 'shared'
    : 'my'

  const href = `${API_BASE}/problem/0/download?mode=${mode}`

  const label =
    mode === 'my' ? 'Download My Problems' : 'Download Shared Problems'

  return (
    <div className="mt-2 flex">
      <Button asChild className="w-[250px]">
        <a href={href} className="flex items-center gap-2">
          <FiDownload className="h-5 w-5 shrink-0" />
          <span>{label}</span>
        </a>
      </Button>
    </div>
  )
}
