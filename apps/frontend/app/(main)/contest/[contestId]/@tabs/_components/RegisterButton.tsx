'use client'

import { Button } from '@/components/ui/button'
import { fetcherWithAuth } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

const getFirstProblemId = async (contestId: string) => {
  const { problems }: { problems: { id: string }[] } = await fetcherWithAuth
    .get(`contest/${contestId}/problem`, {
      searchParams: { take: 1 }
    })
    .json()
  return problems?.at(0)?.id
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
  const [firstProblemId, setFirstProblemId] = useState('')
  const buttonColor = isRegistered ? 'bg-secondary' : 'bg-primary'
  const router = useRouter()
  useEffect(() => {
    async function fetchFirstProblemId() {
      const firstId =
        isRegistered && state === 'Ongoing' ? await getFirstProblemId(id) : ''
      firstId && setFirstProblemId(firstId)
    }
    fetchFirstProblemId()
  }, [isRegistered])
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
          {!isRegistered ? (
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
          ) : (
            <>
              {firstProblemId && (
                <Button
                  className={`px-12 py-6 text-lg font-light ${buttonColor} hover:${buttonColor}`}
                  onClick={() =>
                    router.push(`/contest/${id}/problem/${firstProblemId}`)
                  }
                >
                  Go To First Problem!
                </Button>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
