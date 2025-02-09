'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { Input } from '@/components/shadcn/input'
import { Separator } from '@/components/shadcn/separator'
import { isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import { useEffect, useState } from 'react'

export function RegisterCourseButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  return (
    <>
      <Button variant="slate" onClick={() => setIsDialogOpen(true)}>
        <div className="border-primary flex h-[32px] w-[127px] items-center justify-center gap-2 rounded-full border">
          <div className="border-primary relative flex h-5 w-5 items-center justify-center rounded-full border-2">
            <div className="bg-primary absolute h-[2px] w-[60%] rounded-full" />
            <div className="bg-primary absolute h-[60%] w-[2px] rounded-full" />
          </div>
          <span className="text-primary font-semibold">Register</span>
        </div>
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[416px]" title="register course">
          <DialogHeader>
            <DialogTitle />
          </DialogHeader>
          <RegisterCourse />
        </DialogContent>
      </Dialog>
    </>
  )
}

function RegisterCourse() {
  const [isDialogOpened, setIsDialogOpened] = useState(false)
  return (
    <div className="my-3 flex flex-col items-center gap-5 p-3">
      <p className="font-semibold">Course Register</p>
      <Input
        type="text"
        className="focus-visible:border-primary w-[80%] focus-visible:ring-0"
        placeholder="Invitation Code"
      />
      <Button
        variant="outline"
        className="bg-primary h-[20%] w-[25%]"
        onClick={() => setIsDialogOpened(true)}
      >
        <span className="text-white">Register</span>
      </Button>
      <Dialog open={isDialogOpened} onOpenChange={setIsDialogOpened}>
        <DialogContent className="w-[416px] p-0">
          <DialogHeader>
            <DialogTitle />
          </DialogHeader>
          <RegisterResult />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RegisterResult() {
  const [isVerified, setIsVerified] = useState(false)
  const [apiError, setApiError] = useState<string>('')
  useEffect(() => {
    const clickRegister = async () => {
      try {
        await safeFetcherWithAuth.post('group/4/join')
        setIsVerified(true)
      } catch (error) {
        if (isHttpError(error) && error.response.status === 409) {
          setApiError('You have already requested or joined the group.')
        } else if (isHttpError(error) && error.response.status === 404) {
          setApiError('Group is not found.')
        } else {
          setApiError('Unexpected error occured.')
        }
      }
    }
    clickRegister()
  }, [])

  return (
    <>
      <div className="flex flex-col justify-center px-6 pt-4">
        {isVerified ? (
          <span className="text-primary">Verified</span>
        ) : (
          <span className="text-error">Unverified</span>
        )}
      </div>
      <Separator orientation="horizontal" />

      {isVerified ? (
        <span>Registered Successfully.</span>
      ) : (
        <div className="flex flex-col gap-3 px-6 pb-6 text-sm font-light">
          <span>{apiError}</span>
        </div>
      )}
    </>
  )
}
