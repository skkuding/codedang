'use client'

import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { INVITE_USER } from '@/graphql/user/mutation'
import { fetcherWithAuth } from '@/libs/utils'
import emailIcon from '@/public/icons/email-symbol.svg'
import plusIcon from '@/public/icons/plus-line.svg'
import type { MemberRole } from '@/types/type'
import { useMutation } from '@apollo/client'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { IoMdCloseCircle } from 'react-icons/io'
import { MdOutlineEmail } from 'react-icons/md'
import { toast } from 'sonner'
import { findUserSchema, inviteUserSchema } from '../_libs/schema'

interface InviteUserInput {
  groupId: number
  userId: number
  isGroupLeader: boolean
}

interface FindUserInput {
  email: string
}

interface InviteManuallyProps {
  courseId: string
}

interface UserInfo {
  userName: string
  id: number
}

type SelectedUserDisplay = {
  email: string
  role: 'Instructor' | 'Student'
  userId: number
}

export function InviteManually({ courseId }: InviteManuallyProps) {
  const roles: MemberRole[] = ['Instructor', 'Student']
  const userId = 0
  const [inviteUser] = useMutation(INVITE_USER)
  const [selectedList, setSelectedList] = useState<SelectedUserDisplay[]>([])
  const [emailDomain, setEmailDomain] = useState('@skku.edu')

  const onFind: SubmitHandler<FindUserInput> = async (data) => {
    const emailRevised = data.email + emailDomain

    try {
      const res = await fetcherWithAuth('user/email', {
        searchParams: { email: emailRevised }
      })

      if (!res.ok) {
        toast.error('Failed to find user')
        return
      }

      const userInfo: UserInfo = await res.json()
      setSelectedList((prev) =>
        prev.some((u) => u.email === emailRevised)
          ? prev
          : [
              ...prev,
              {
                email: emailRevised,
                role: inviteWatch('isGroupLeader') ? 'Instructor' : 'Student',
                userId: userInfo.id
              }
            ]
      )
    } catch (err) {
      console.error(err)
      toast.error('Unexpected error occurred')
    }
  }

  const onInvite: SubmitHandler<InviteUserInput> = useCallback(async () => {
    if (selectedList.length === 0) {
      toast.error('No user selected to invite')
      return
    }

    for (const user of selectedList) {
      try {
        const result = await inviteUser({
          variables: {
            groupId: Number(courseId),
            isGroupLeader: user.role === 'Instructor',
            userId: user.userId
          }
        })

        toast.success('Invited Successfully!', {
          style: {
            background: '#F0F8FF',
            color: '#0973DC',
            borderRadius: '1000px',
            border: '1px solid rgba(255, 255, 255, 0.10)'
          },
          closeButton: false
        })
      } catch {
        toast.error('Failed to invite user')
      }
    }
  }, [inviteUser, courseId, selectedList])

  const {
    register: findRegister,
    handleSubmit: findHandleSubmit,
    formState: { errors: findErrors },
    setValue: findSetValue
  } = useForm<FindUserInput>({
    resolver: valibotResolver(findUserSchema)
  })

  const {
    watch: inviteWatch,
    handleSubmit: inviteHandleSubmit,
    setValue: inviteSetValue,
    formState: { errors: inviteErrors }
  } = useForm<InviteUserInput>({
    resolver: valibotResolver(inviteUserSchema),
    defaultValues: {
      userId,
      groupId: Number(courseId),
      isGroupLeader: false
    }
  })

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          findHandleSubmit(onFind)()
        }}
        aria-label="Invite user"
        className="flex flex-col gap-3 rounded-lg border p-[30px]"
      >
        <span className="font-pretendard text-lg">Invite Manually</span>
        <div className="border-line flex flex-col items-start self-stretch border-b pb-[30px]">
          <div className="flex items-center gap-[10px] self-stretch">
            <div className="flex flex-1 items-center gap-1">
              <div className="flex h-10 w-full items-center rounded-full border border-gray-300 px-5">
                <MdOutlineEmail className="h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  {...findRegister('email')}
                  placeholder="Enter the e-mail"
                  className="flex-1 border-none !bg-transparent pl-2 text-base placeholder:text-gray-400 autofill:!bg-transparent focus:outline-none focus:ring-0 focus-visible:border-none focus-visible:outline-none focus-visible:ring-0"
                />
              </div>

              <div className="border-line flex h-10 flex-1 items-center gap-[6px] rounded-full border bg-white px-[14px]">
                <Select
                  value={emailDomain}
                  onValueChange={setEmailDomain}
                  defaultValue="@skku.edu"
                >
                  <Image src={emailIcon} alt="emailIcon" />
                  <SelectTrigger className="flex items-center gap-2 border-none bg-transparent text-base leading-[150%] tracking-[-0.48px] text-black focus:outline-none focus:ring-0 focus-visible:border-none">
                    <SelectValue placeholder="@skku.edu" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg bg-white shadow-md">
                    <SelectItem value="@gmail.com">gmail.com</SelectItem>
                    <SelectItem value="@naver.com">naver.com</SelectItem>
                    <SelectItem value="@daum.com">daum.com</SelectItem>
                    <SelectItem value="@skku.edu">skku.edu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-line flex h-10 w-[120px] items-start justify-center rounded-full border bg-white px-5">
                <Select
                  value={
                    inviteWatch('isGroupLeader') ? 'Instructor' : 'Student'
                  }
                  onValueChange={(value) => {
                    inviteSetValue('isGroupLeader', value === 'Instructor')
                  }}
                >
                  <SelectTrigger className="flex w-auto items-center gap-2 border-none bg-transparent text-base leading-[150%] tracking-[-0.48px] text-black focus:outline-none">
                    <SelectValue placeholder="Student" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg bg-white shadow-md">
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div
              className="border-primary flex cursor-pointer items-center justify-center gap-1 rounded-full border bg-white px-[22px] py-[10px]"
              onClick={() => findHandleSubmit(onFind)()}
            >
              <Image src={plusIcon} alt="plusIcon" />
              <span className="text-primary font-pretendard text-[14px] font-medium leading-[140%] tracking-[-0.42px]">
                Add
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-[10px] self-stretch">
          <span className="text-primary font-pretendard overflow-hidden text-ellipsis text-sm font-normal leading-[21px] tracking-[-0.42px]">
            {selectedList.length} user(s) selected
          </span>

          <div className="flex flex-col items-start gap-2 self-stretch">
            {selectedList.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-[10px] self-stretch"
              >
                <div className="border-line flex h-10 flex-1 items-center justify-between rounded-full border bg-white px-5">
                  <div className="flex items-center gap-[10px]">
                    <MdOutlineEmail className="h-5 w-5 text-gray-400" />
                    <span className="font-pretendard text-base">
                      {user.email}
                    </span>
                  </div>
                  <IoMdCloseCircle
                    className="h-[18px] w-[18px] cursor-pointer text-gray-400"
                    onClick={() =>
                      setSelectedList((prev) =>
                        prev.filter((u) => u.email !== user.email)
                      )
                    }
                  />
                </div>

                <div className="border-line flex h-10 w-[120px] items-center justify-center gap-1 rounded-full border bg-white px-5">
                  <span className="font-pretendard text-base">{user.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {findErrors.email && (
          <ErrorMessage message={findErrors.email.message} />
        )}
        {inviteErrors.groupId && (
          <ErrorMessage message={inviteErrors.groupId.message} />
        )}
        {inviteErrors.userId && (
          <ErrorMessage message={inviteErrors.userId.message} />
        )}
        {inviteErrors.isGroupLeader && (
          <ErrorMessage message={inviteErrors.isGroupLeader.message} />
        )}
      </form>

      <Button
        type="button"
        className="bg-primary hover:bg-primary-strong font-pretendard mt-[30px] h-11 w-full rounded-full text-base text-white"
        onClick={() => inviteHandleSubmit(onInvite)()}
      >
        Invite
      </Button>
    </div>
  )
}
