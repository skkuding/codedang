'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { fetcherWithAuth } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'

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
  const [firstProblemId, setFirstProblemId] = useState('')
  const buttonColor = registered ? 'bg-secondary' : 'bg-primary'
  const router = useRouter()
  const clickRegister = async (contestId: string) => {
    await fetcherWithAuth
      .post(`contest/${contestId}/participation`, {
        searchParams: { groupId: 1 }
      })
      .then((res) => {
        res.json()
        router.refresh()
      })
      .catch((err) => console.log(err))
  }
  const clickDeregister = async (contestId: string) => {
    await fetcherWithAuth
      .delete(`contest/${contestId}/participation`, {
        searchParams: { groupId: 1 }
      })
      .then((res) => {
        res.json()
        router.refresh()
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    async function fetchFirstProblemId() {
      const firstId =
        registered && state === 'Ongoing' ? await getFirstProblemId(id) : ''
      firstId && setFirstProblemId(firstId)
    }
    fetchFirstProblemId()
  }, [registered])
  return (
    <>
      <Suspense fallback={<Skeleton className="px-12 py-6"></Skeleton>}>
        {state === 'Upcoming' ? (
          <Button
            className={`px-12 py-6 text-lg font-light ${buttonColor} hover:${buttonColor}`}
            onClick={() => {
              if (registered) {
                clickDeregister(id)
                toast.success('Deregistered Upcoming test successfully')
              } else {
                clickRegister(id)
                toast.success('Registered Upcoming test successfully')
              }
            }}
          >
            {registered ? 'Deregister' : 'Register'}
          </Button>
        ) : (
          <>
            {!registered ? (
              <Button
                className={`px-12 py-6 text-lg font-light ${buttonColor} hover:${buttonColor}`}
                onClick={() => {
                  clickRegister(id)
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
      </Suspense>
    </>
  )
}
