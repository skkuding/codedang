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
  const buttonColor = isRegistered ? 'bg-secondary' : 'bg-primary'
  return (
    <>
      {state === 'Upcoming' ? (
        <Button
          className={`px-12 py-6 text-lg font-light ${buttonColor} hover:${buttonColor}`}
          onClick={() => {
            if (isRegistered) {
              clickDeregister(id)
              setIsRegistered(false)
              toast.success('Deregistered Upcoming test successfully')
            } else {
              clickRegister(id)
              setIsRegistered(true)
              toast.success('Registered Upcoming test successfully')
            }
          }}
        >
          {isRegistered ? 'Deregister' : 'Register'}
        </Button>
      ) : (
        <>
          {!isRegistered && (
            <Button
              className={`px-12 py-6 text-lg font-light ${buttonColor} hover:${buttonColor}`}
              onClick={() => {
                clickRegister(id)
                setIsRegistered(true)
                toast.success('Registered Ongoing test successfully')
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
