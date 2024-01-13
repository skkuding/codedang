'use client'

import { Switch } from '@/components/ui/switch'
import { baseUrl } from '@/lib/vars'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

export default function TagSwitch() {
  const searchParams = useSearchParams()
  const search = searchParams?.get('search') ?? ''
  const isTagChecked = searchParams?.get('tag') === 'tag' /*boolean*/

  const router = useRouter()
  const onClick = () => {
    const newUrl = new URL('/problem', baseUrl)
    search && newUrl.searchParams.set('search', search)
    isTagChecked
      ? newUrl.searchParams.delete('tag')
      : newUrl.searchParams.set('tag', 'tag')
    router.push(`?${newUrl.searchParams}`, { scroll: false })
  }

  return (
    <>
      <Switch checked={isTagChecked} onClick={onClick} />
    </>
  )
}
