'use client'

import { Button } from '@/components/ui/button'
import { fetcherWithAuth } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

const clickRegister = async (contestId: string) => {
  await fetcherWithAuth
    .post(`contest/${contestId}/participation`, {
      searchParams: { groupId: 1 }
    })
    .then((res) => res.json())
    .catch((err) => console.log(err))
}

const clickDeregister = async (contestId: string) => {
  await fetcherWithAuth
    .delete(`contest/${contestId}/participation`, {
      searchParams: { groupId: 1 }
    })
    .then((res) => res.json())
    .catch((err) => console.log(err))
}

export default function RegisterButton({
  id,
  registered,
  state
}: {
  id: string
  registered: boolean
  state: string
}) {
  const [isRegistered, setIsRegistered] = useState(registered)
  return (
    <>
      {state === 'Upcoming' ? (
        <Button
          className="px-12 py-6 text-lg font-light"
          onClick={() => {
            if (isRegistered) {
              clickDeregister(id)
              setIsRegistered(false)
              toast.success('Deregistered successfully to Upcoming test')
            } else {
              clickRegister(id)
              setIsRegistered(true)
              toast.success('Registered successfully to Upcoming test')
            }
          }}
        >
          {isRegistered ? 'Deregister' : 'Register'}
        </Button>
      ) : (
        <>
          {!isRegistered && (
            <Button
              className="px-12 py-6 text-lg font-light"
              onClick={() => {
                clickRegister(id)
                setIsRegistered(true)
                toast.success('Registered successfully to Ongoing test')
              }}
            >
              Register
            </Button>
          )}
        </>
      )}
    </>
  )
}
