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
import { cn, fetcherWithAuth } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface RegisterCodeInput {
  invitationCode: string
}

const schema = z.object({
  invitationCode: z.string().length(6)
})

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
  title,
  hasInvitationCode
}: {
  id: string
  registered: boolean
  state: string
  title: string
  hasInvitationCode: boolean
}) {
  const [firstProblemId, setFirstProblemId] = useState('')
  // const buttonColor = registered ? 'bg-secondary' : 'bg-primary'
  const router = useRouter()
  const clickRegister = async (contestId: string) => {
    if (hasInvitationCode) {
      await fetcherWithAuth
        .post(`contest/${contestId}/participation`, {
          searchParams: {
            groupId: 1,
            invitationCode: getValues('invitationCode')
          }
        })
        .then((res) => {
          res.json()
          router.refresh()
        })
        .catch((err) => console.log(err))
    } else {
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
  }
  // const clickDeregister = async (contestId: string) => {
  //   await fetcherWithAuth
  //     .delete(`contest/${contestId}/participation`, {
  //       searchParams: { groupId: 1 }
  //     })
  //     .then((res) => {
  //       res.json()
  //       router.refresh()
  //     })
  //     .catch((err) => console.log(err))
  // }

  useEffect(() => {
    async function fetchFirstProblemId() {
      if (registered && state === 'Ongoing') {
        const firstId = await getFirstProblemId(id)
        setFirstProblemId(firstId ?? '')
      } else {
        setFirstProblemId('')
      }
    }
    fetchFirstProblemId()
  }, [registered, state, id])

  const {
    handleSubmit,
    register,
    trigger,
    getValues,
    formState: { errors }
  } = useForm<RegisterCodeInput>({
    resolver: zodResolver(schema)
  })

  // TODO: change to async function
  const onSubmit = async () => {
    clickRegister(id)
    toast.success(`Registered ${state} test successfully`)
  }

  return (
    <>
      {registered ? (
        <>
          {/* {state === 'Upcoming' ? (
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
            <> */}
          {firstProblemId && (
            <Button
              className="px-12 py-6 text-lg font-light"
              onClick={() =>
                router.push(`/contest/${id}/problem/${firstProblemId}`)
              }
            >
              Go To First Problem!
            </Button>
          )}
          {/* </>
          )} */}
        </>
      ) : (
        <Dialog>
          <DialogTrigger
            disabled={state === 'Upcoming' || !hasInvitationCode}
            asChild
          >
            <Button
              className="px-12 py-6 text-lg disabled:bg-gray-300 disabled:text-gray-600"
              disabled={state === 'Upcoming'}
              onClick={() => {
                if (!hasInvitationCode) {
                  clickRegister(id)
                  toast.success(`Registered ${state} test successfully`)
                }
              }}
            >
              Register Now
            </Button>
          </DialogTrigger>
          <DialogContent className="flex w-[416px] flex-col gap-6 p-10">
            <DialogHeader>
              <DialogTitle className="line-clamp-2 text-xl">
                {title}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="Register Code"
                  {...register('invitationCode', {
                    onChange: () => trigger('invitationCode')
                  })}
                  type="number"
                  className={cn(
                    'h-12 w-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                    errors.invitationCode &&
                      'border-red-500 focus-visible:ring-red-500'
                  )}
                />
                {errors.invitationCode && (
                  <p className="text-xs text-red-500">Incorrect</p>
                )}
              </div>
              <div className="flex justify-center">
                <Button type="submit" className="w-24">
                  Register
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
