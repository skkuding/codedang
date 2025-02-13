'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import { Input } from '@/components/shadcn/input'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as v from 'valibot'

interface InvitationCodeInput {
  invitationCode: string
}

const schema = v.object({
  invitationCode: v.pipe(v.string(), v.length(6))
})

export function RegisterButton({
  id,
  state,
  title,
  invitationCodeExists
}: {
  id: string
  state: string
  title: string
  invitationCodeExists: boolean
}) {
  const router = useRouter()
  const clickRegister = async (contestId: string) => {
    try {
      await safeFetcherWithAuth.post(`contest/${contestId}/participation`, {
        searchParams: invitationCodeExists
          ? {
              groupId: 1,
              invitationCode: getValues('invitationCode')
            }
          : { groupId: 1 }
      })
      toast.success(`Registered ${state} test successfully`)
      //router.push(`/contest/${contestId}`)
      router.refresh() // to update register state
    } catch (error) {
      console.error(error)
      toast.error(invitationCodeExists ? 'Invalid code' : 'Failed to register')
    }
  }

  const {
    handleSubmit,
    register,
    trigger,
    getValues,
    formState: { errors }
  } = useForm<InvitationCodeInput>({
    resolver: valibotResolver(schema)
  })

  const onSubmit = () => {
    clickRegister(id)
  }

  return !invitationCodeExists ? (
    // User not registered and no invitation code required
    <Button
      className="h-12 w-[940px] rounded-full px-12 py-6 text-lg disabled:bg-gray-300 disabled:text-gray-600"
      disabled={state === 'Upcoming'}
      onClick={onSubmit}
    >
      Register Now!
    </Button>
  ) : (
    // User not registered and invitation code required
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="h-12 w-[940px] rounded-full px-12 py-6 text-lg disabled:bg-gray-300 disabled:text-gray-600"
          disabled={state === 'Upcoming'}
        >
          Register Now!
        </Button>
      </DialogTrigger>
      <DialogContent className="flex w-[416px] flex-col gap-6 p-10">
        <DialogHeader>
          <DialogTitle className="line-clamp-2 text-xl">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <Input
              placeholder="Invitation Code"
              {...register('invitationCode', {
                onChange: () => trigger('invitationCode')
              })}
              type="number"
              className={cn(
                'hide-spin-button h-12 w-full',
                errors.invitationCode &&
                  'border-red-500 focus-visible:ring-red-500'
              )}
            />
            {errors.invitationCode && (
              <p className="text-xs text-red-500">
                Register Code must be a 6-digit number
              </p>
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
  )
}
