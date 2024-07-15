'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { fetcherWithAuth } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  state,
  title
}: {
  id: string
  registered: boolean
  state: string
  title: string
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
      {registered ? (
        <>
          {state === 'Upcoming' ? (
            <Button
              className={`px-12 py-6 text-lg font-light ${buttonColor} hover:${buttonColor}`}
              onClick={() => {
                clickDeregister(id)
                toast.success('Deregistered Upcoming test successfully')
              }}
            >
              Deregister
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
      ) : (
        <Dialog>
          <DialogTrigger>
            <Button
              className={`px-12 py-6 text-lg font-light ${buttonColor} hover:${buttonColor}`}
            >
              Register Now
            </Button>
          </DialogTrigger>
          <DialogContent className="flex w-[416px] flex-col gap-8 p-10">
            <DialogHeader>
              <DialogTitle className="line-clamp-2 text-xl">
                {title}
              </DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Register Code"
              type="number"
              className="h-12 w-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  clickRegister(id)
                  toast.success(`Registered ${state} test successfully`)
                }}
                className="w-24"
              >
                Register
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
