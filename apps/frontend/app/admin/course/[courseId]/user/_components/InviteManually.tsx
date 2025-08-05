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
import type { MemberRole } from '@/types/type'
import { useMutation } from '@apollo/client'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useCallback, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { IoMdCloseCircle } from 'react-icons/io'
import { MdOutlineEmail, MdOutlineAddCircle } from 'react-icons/md'
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

type SearchedUserDisplay = {
  email: string
  role: 'Instructor' | 'Student'
  userId: number
}

type SelectedUserDisplay = {
  email: string
  role: 'Instructor' | 'Student'
  userId: number
}

type InvitedUserDisplay = {
  email: string
  role: 'Instructor' | 'Student'
}

export function InviteManually({ courseId }: InviteManuallyProps) {
  const roles: MemberRole[] = ['Instructor', 'Student']
  const userId = 0

  const [invitedList, setInvitedList] = useState<InvitedUserDisplay[]>([])
  const [inviteUser] = useMutation(INVITE_USER)

  const [searchedList, setSearchedList] = useState<SearchedUserDisplay[]>([])
  const [selectedList, setSelectedList] = useState<SelectedUserDisplay[]>([])

  const onFind: SubmitHandler<FindUserInput> = async (data) => {
    let emailRevised = data.email

    if (!emailRevised.includes('@')) {
      emailRevised += '@skku.edu'
      findSetValue('email', emailRevised)
    }

    try {
      setSearchedList([])
      const res = await fetcherWithAuth('user/email', {
        searchParams: { email: emailRevised }
      })

      if (!res.ok) {
        toast.error('Failed to find user')
        return
      }

      const userInfo: UserInfo = await res.json()
      setSearchedList([
        {
          email: emailRevised,
          role: inviteWatch('isGroupLeader') ? 'Instructor' : 'Student',
          userId: userInfo.id
        }
      ])
    } catch (err) {
      setSearchedList([])
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

        setInvitedList((prevList) => [
          ...prevList,
          {
            email: result.data?.inviteUser.user.email ?? '',
            role: result.data?.inviteUser.isGroupLeader
              ? 'Instructor'
              : 'Student'
          }
        ])

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
        className="flex flex-col gap-5 rounded-lg border p-[30px]"
      >
        <span className="font-pretendard text-lg">Invite Manually</span>
        <div className="border-line flex flex-col items-start gap-[10px] self-stretch border-b pb-[30px]">
          <div className="flex items-center gap-[10px] self-stretch">
            <div className="flex h-10 w-full items-center rounded-full border border-gray-300 px-5 py-2">
              <MdOutlineEmail className="h-5 w-5 text-gray-400" />
              <Input
                id="email"
                {...findRegister('email')}
                placeholder="Please enter the e-mail"
                className="flex-1 border-none !bg-transparent pl-2 text-base placeholder:text-gray-400 autofill:!bg-transparent focus:outline-none focus:ring-0 focus-visible:border-none focus-visible:outline-none focus-visible:ring-0"
              />
            </div>

            <div className="border-line flex h-10 w-[120px] items-start justify-center gap-1 rounded-full border bg-white px-5">
              <Select
                value={inviteWatch('isGroupLeader') ? 'Instructor' : 'Student'}
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

          {searchedList.map((user) => (
            <div
              key={user.userId}
              className="flex items-center gap-[10px] self-stretch"
            >
              <div className="flex h-10 flex-[1_0_0] items-center justify-between rounded-full bg-gray-100 px-5">
                <div className="flex items-center gap-[10px]">
                  <MdOutlineEmail className="h-5 w-5 text-gray-400" />
                  <span className="font-pretendard text-base">
                    {user.email}
                  </span>
                </div>
                <MdOutlineAddCircle
                  className="h-[18px] w-[18px] cursor-pointer text-gray-400"
                  onClick={() =>
                    !selectedList.some((u) => u.email === user.email) &&
                    setSelectedList((prev) => [...prev, user])
                  }
                />
              </div>

              <div className="flex h-10 w-[120px] items-center justify-center gap-1 rounded-full bg-gray-100 px-5">
                <span className="font-pretendard text-base">{user.role}</span>
              </div>
            </div>
          ))}
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
