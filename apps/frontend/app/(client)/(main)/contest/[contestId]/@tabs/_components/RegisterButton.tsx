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

interface RegisterButtonProps {
  id: string
  state: string
  title: string
  invitationCodeExists: boolean
  disabled: boolean
}

const schema = v.object({
  invitationCode: v.pipe(v.string(), v.length(6))
})

export function RegisterButton({
  id,
  state,
  title,
  invitationCodeExists,
  disabled
}: RegisterButtonProps) {
  const router = useRouter()
  const clickRegister = async (contestId: string) => {
    try {
      await safeFetcherWithAuth.post(`contest/${contestId}/participation`, {
        searchParams: invitationCodeExists
          ? {
              invitationCode: getValues('invitationCode')
            }
          : {}
      })
      toast.success(`Registered ${state} test successfully`)
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
      className="bg-primary border-primary h-[46px] w-[940px] rounded-full px-12 py-6 text-[16px] font-bold text-white"
      onClick={onSubmit}
      disabled={disabled}
    >
      Register Now!
    </Button>
  ) : (
    // User not registered and invitation code required
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="bg-primary border-primary h-[46px] w-[940px] rounded-full px-12 py-6 text-[16px] font-bold text-white"
          disabled={disabled}
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
