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
import plusCircleIcon from '@/public/icons/plus-circle.svg'
import type { Course } from '@/types/type'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function RegisterCourseButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  return (
    <>
      <Button variant="slate" onClick={() => setIsDialogOpen(true)}>
        <div className="border-primary flex h-8 w-[127px] items-center justify-center gap-2 rounded-full border">
          <Image src={plusCircleIcon} alt="plusIcon" />
          <span className="text-primary text-lg font-semibold">Register</span>
        </div>
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[416px]" title="register course">
          <DialogTitle>Register course</DialogTitle>
          <RegisterCourse />
        </DialogContent>
      </Dialog>
    </>
  )
}

function RegisterCourse() {
  const [isDialogOpened, setIsDialogOpened] = useState(false)
  const [invitationCode, setInvitationCode] = useState('')
  return (
    <div className="my-3 flex flex-col items-center gap-5">
      <Input
        type="text"
        className="focus-visible:border-primary focus-visible:ring-0"
        placeholder="Invitation Code"
        value={invitationCode}
        onChange={(e) => setInvitationCode(e.target.value)}
      />
      <Button
        variant="outline"
        className="bg-primary"
        onClick={() => setIsDialogOpened(true)}
      >
        <span className="text-white">Register</span>
      </Button>
      <Dialog open={isDialogOpened} onOpenChange={setIsDialogOpened}>
        <DialogContent className="w-[416px] p-0">
          <DialogHeader>
            <DialogTitle />
          </DialogHeader>
          <RegisterResult
            invitationCode={invitationCode}
            setInvitationCode={setInvitationCode}
            setIsDialogOpened={setIsDialogOpened}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RegisterResult({
  invitationCode,
  setInvitationCode,
  setIsDialogOpened
}: {
  invitationCode: string
  setInvitationCode: (value: string) => void
  setIsDialogOpened: (value: boolean) => void
}) {
  const [isVerified, setIsVerified] = useState(false)
  const [apiError, setApiError] = useState<string>('')
  const [foundCourse, setFoundCourse] = useState<null | Course>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleFindCourseByInvitation = async () => {
      try {
        const data = await safeFetcherWithAuth
          .get('course/invite', {
            searchParams: { invitation: invitationCode }
          })
          .json<Course>()
        setIsVerified(true)
        setFoundCourse(data)
      } catch (error) {
        if (isHttpError(error) && error.response.status === 404) {
          setApiError('Invalid invitation code.')
        } else {
          setApiError('Invalid request.')
        }
        setInvitationCode('')
      }
    }
    handleFindCourseByInvitation()
  }, [])

  const handleRegisterCourse = async () => {
    try {
      await safeFetcherWithAuth.post(`course/${foundCourse?.id}/join`, {
        searchParams: { invitation: invitationCode }
      })
      queryClient.invalidateQueries({ queryKey: ['joinedCourses'] })
      toast.success('Successfully registered course.')
      setIsDialogOpened(false)
    } catch (error) {
      if (isHttpError(error) && error.response.status === 409) {
        setApiError('You have already requested or joined the group.')
      } else if (isHttpError(error) && error.response.status === 404) {
        setApiError('Group is not found.')
      } else {
        setApiError('Invalid invitation code.')
      }
      setIsVerified(false)
      setInvitationCode('')
    }
  }

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
        <div className="flex flex-col gap-3 px-6 pb-6 text-sm font-light">
          <span>Do you want to register this course?</span>
          <span className="text-primary">
            [{foundCourse?.courseInfo?.courseNum}-
            {foundCourse?.courseInfo?.classNum}] {foundCourse?.groupName}
          </span>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="bg-primary"
              onClick={handleRegisterCourse}
            >
              <span className="text-white">Register</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-6 pb-6 text-sm font-light">
          <span>{apiError}</span>
        </div>
      )}
    </>
  )
}
