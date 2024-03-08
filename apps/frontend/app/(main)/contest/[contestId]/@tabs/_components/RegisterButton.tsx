'use client'

import { Button } from '@/components/ui/button'
import { fetcherWithAuth } from '@/lib/utils'

const handleClick = async (contestId: string) => {
  await fetcherWithAuth
    .post(`contest/${contestId}/participation`, {
      searchParams: { groupId: 1 }
    })
    .then((res) => res.json())
    .catch((err) => console.log(err))
}

export default function RegisterButton({ id }: { id: string }) {
  return (
    <Button
      className="px-12 py-6 text-lg font-light"
      onClick={() => handleClick(id)}
    >
      Register
    </Button>
  )
}
